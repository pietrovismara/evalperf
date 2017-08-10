const math = require('./math');
const readline = require('readline');

class Result {
    static calcStats(values) {
        const avgTiming = math.average(values.timings);
        const std = math.standardDeviation(values.timings, avgTiming);
        return {
            avgTiming: avgTiming,
            std: std,
            errorRate: (std / avgTiming) * 100
        };
    }

    constructor(key, values) {
        this.key = key;
        this.v = {
            timings: [],
            hz: [],
            totTime: []
        };
        this.addValues(values);
    }

    getStats() {
        return this.s;
    }

    getValues() {
        return {
            timings: math.average(this.v.timings),
            hz: math.average(this.v.hz),
            totTime: math.average(this.v.totTime)
        };
    }

    addValues(values) {
        this.v.timings = this.v.timings.concat(values.timings);
        this.v.hz = this.v.hz.concat(values.hz);
        this.v.totTime = this.v.totTime.concat(values.totTime);
        this.s = Result.calcStats(this.v);
    }

    report() {
        const values = this.getValues();
        process.stdout.write('\n\n');
        console.log(`
${this.key}
Ops per second: ${values.hz} op/s
Average op duration: ${this.s.avgTiming} ms/op
Standard deviation: ${this.s.std} ms/op
Total test time: ${values.totTime / 1000}s
Error rate: ${this.s.errorRate.toFixed(2)}%`
        );
        process.stdout.write('\n');
    }
}

module.exports = Result;
