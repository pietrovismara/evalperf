const EventEmitter = require('events');
const Result = require('./result');
const cycleEvents = require('./cycle-events');

const defaultSettings = {
    maxErrorRate: 18,
    retryCycles: 20,
    minCycles: 20,
    maxRetry: 10
};

module.exports = runnerFactory;

/**
* @param {Object} userSettings - see defaultSettings
* @return {Object} - An object containing the methods needed for running tests
**/
function runnerFactory(userSettings) {
    const settings = Object.assign(defaultSettings);
    if (userSettings) {
        Object.assign(settings, userSettings);
    }
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
    * @return {Array<Object>} Results
    **/
    function start() {
        const results = tests.map((test) => {
            emitter.emit('testStart', test.key);
            try {
                let values = run(test.key, test.fn, settings.minCycles);
                let result = new Result(test.key, values);
                let i = 0;
                while (result.getStats().errorRate >= settings.maxErrorRate && i < settings.maxRetry) {
                    result.addValues(run(test.key, test.fn, settings.retryCycles));
                    i += 1;
                }
                emitter.emit('testEnd', result);
                return result;
            } catch(e) {
                emitter.emit('testError', e);
            }
        });

        const sorted = results.map((r) => {
            return r;
        })
        .sort((a, b) => a.getValues().hz + b.getValues().hz);

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
            emitter.emit('cycle', new cycleEvents.Single(key, x));
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
