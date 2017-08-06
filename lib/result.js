const math = require('./math');
const readline = require('readline');

class Result {
    constructor(key, values, stats) {
        this.key = key;
        this.v = values;
        if (stats) {
            this.s = stats;
            return;
        }
        const avgTiming = math.average(values.timings);
        const std = math.standardDeviation(values.timings, avgTiming);
        this.s = {
            avgTiming: avgTiming,
            std: std
        };
    }

    get stats() {
        return this.s;
    }

    get values() {
        return this.v;
    }

    report() {
        process.stdout.write('\n\n');
        console.log(`
${this.key}
Ops per second: ${this.values.hz} op/s
Average op duration: ${this.stats.avgTiming} ms/op
Standard deviation: ${this.stats.std} ms/op
Total test time: ${this.values.totTime / 1000}s`
        );
        process.stdout.write('\n');
    }
}

module.exports = Result;
