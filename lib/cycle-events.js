const readline = require('readline');

class CycleEvent {
    constructor(key, n, iterations) {
        this.key = key;
        this.n = n;
        this.iterations = iterations;
        this.percentage = ((n / iterations) * 100).toFixed(2) * 1;
    }

    report() {
        process.stdout.write(`${this.key}: ${this.percentage}%\r`);
    }
}

class CycleEventList {
    constructor(list) {
        this.list = list;
        this.keysMap = this.list.reduce((keysMap, p, i) => {
            keysMap[p.key] = i;
            return keysMap;
        }, {});
    }

    setProgress(p) {
        this.list[this.keysMap[p.key]] = p;
    }

    hasAllValues() {
        return this.list.every(p => !!p.percentage);
    }

    report() {
        this.list.forEach((p) => {
            process.stdout.write(`${p.key}: ${p.percentage}%`);
            readline.moveCursor(process.stdout, 0, 1);
            readline.cursorTo(process.stdout, 0);
        });
        process.stdout.write(`\r`);
        readline.moveCursor(process.stdout, 0, -this.list.length);
    }
}

module.exports = {
    List: CycleEventList,
    Single: CycleEvent
};
