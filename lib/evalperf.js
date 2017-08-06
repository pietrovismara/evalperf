const EventEmitter = require('events');
const Result = require('./result');
const cycleEvents = require('./cycle-events');

module.exports = runnerFactory;

/**
* @return {Object} - An object containing the methods needed for running tests
**/
function runnerFactory() {
    const tests = [];

    const emitter = new EventEmitter();
    emitter.setTest = setTest;
    emitter.start = start;
    return emitter;

    /**
    * @param {Object} test
    * @param {String} test.key - An identifier for the test
    * @param {Function} test.fn - The function to test
    * @param {Array} test.args - The arguments for fn, in the same order
    **/
    function setTest(test) {
        const {key, fn, args} = test;
        tests.push({
            key: key,
            fn: () => {
                fn.apply(null, args);
            }
        });

        return this;
    }

    /**
    * @param {Number} iterations - The number of iterations for the test
    * @return {Array<Object>} The results
    **/
    function start(iterations) {
        iterations = iterations || 10;
        const results = tests.map((test) => {
            emitter.emit('testStart', test.key);
            try {
                let values = run(test.key, test.fn, iterations);
                const result = new Result(test.key, values);
                emitter.emit('testEnd', result);
                return result;
            } catch(e) {
                emitter.emit('testError', e);
            }
        });

        const sorted = results.map((r) => {
            return r;
        })
        .sort((a, b) => a.values.hz + b.values.hz);

        return sorted;
    }

    function run(key, fn, iterations) {
        const timings = [];
        let x = 0;
        const totClockStart = clock();
        while (x <= iterations) {
            const start = clock();
            fn();
            timings.push(clock(start));
            emitter.emit('cycle', new cycleEvents.Single(key, x, iterations));
            x += 1;
        }
        const totTime = clock(totClockStart);

        return {
            timings: timings,
            hz: (iterations * 1000) / totTime,
            totTime: totTime
        };
    }
}

function clock(start) {
    if ( !start ) return process.hrtime();
    var end = process.hrtime(start);
    return Math.round((end[0]*1000) + (end[1]/1000000));
}
