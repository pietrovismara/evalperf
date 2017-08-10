const {fork} = require('child_process');
const {cpus} = require('os');
const path = require('path');
const EventEmitter = require('events');

const Result = require('./result');
const cycleEvents = require('./cycle-events');

const num_cpus = cpus().length;
const worker_path = path.join(__dirname, 'child-runner.js');

module.exports = parRunnerFactory;

/**
* @param {Object} userSettings
* @param {Number} maxParProc - The number of maximum parallel processes to be launched at time
* @return {Object} - An object containing the methods needed for running tests
**/
function parRunnerFactory(userSettings, maxParProc) {
    maxParProc = maxParProc || num_cpus;
    const tests = [];
    const emitter = new EventEmitter();
    emitter.setTest = setTest;
    emitter.start = start;

    return emitter;

    /**
    * @param {Object} test
    * @param {String} test.key - An identifier for the test
    * @param {String} test.modulePath - The path to the module to be executed
    * @param {String} test.method - The method to be called on module.
    *                               If not given, module will be treated as a function
    * @param {Array} test.args - The arguments for fn, in the same order
    **/
    function setTest(test) {
        tests.push(test);
        return this;
    }

    /**
    * @param {Number} iterations - The number of iterations for the test
    * @return {Promise<Array[Object]>} The results
    **/
    function start(iterations) {
        const results = [];
        setCyclesListeners();
        return asyncForEach(splitArray(tests, maxParProc, iterations), (promise, ts) => {
            return promise
            .then(() => Promise.all(ts.map(testData => launchWorker(testData))))
            .then((res) => results.push(res))            
        })
        .then(() => [].concat.apply([], results))
        .then(res => res.sort((a, b) => a.getStats().avgTiming - b.getStats().avgTiming))
    }

    function setCyclesListeners() {
        const cList = new cycleEvents.List(tests.map((t) => {
            return new cycleEvents.Single(t.key, 0);
        }));
        emitter.on('cycle', (progress) => {
            cList.setProgress(progress);
            emitter.emit('par-cycle', cList);
        });
    }

    function splitArray(arr, size, iterations) {
        const splitted = [];
        while (arr.length > 0) {
            splitted.push(
                arr.splice(0, size).map((t) => {
                    return {
                        testData: t,
                        iterations: iterations
                    }
                })
            );
        }
        return splitted;
    }

    function launchWorker(test) {
        return new Promise((resolve, reject) => {
            const n = fork(worker_path);
            let serializedIndexes = [];
            test.testData.args = test.testData.args.map((arg, i) => {
                if (Buffer.isBuffer(arg)) {
                    serializedIndexes.push(i);
                    return `Buffer('${arg.toString('base64')}', 'base64')`;
                }
                return arg;
            });

            if (serializedIndexes.length) {
                test.testData.args = {
                    values: test.testData.args,
                    serialized: serializedIndexes
                }
            }

            n.on('message', (m) => {
                if (m.event === 'testEnd') {
                    let data = new Result(m.data.key, m.data.v);
                    emitter.emit(m.event, data);
                    n.kill();
                    return resolve(data);
                } else if (m.event === 'testError') {
                    emitter.emit(m.event, m.data);
                    n.kill();
                    return reject(m.data);
                }
                emitter.emit(m.event, m.data);
            });

            n.on('error', (err) => {
                n.kill();
                reject(err);
            });

            n.send(test);
        });
    }
}

// Takes an array and a function to be called on each array element
// Returns a promise, that is fulfilled when all promises are fulfilled
function asyncForEach(array, fn) {
    // For each element in the array, calls doIteration
    return array.reduce(fn, Promise.resolve());
}
