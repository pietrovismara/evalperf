const readline = require('readline');

class CycleEvent {
    constructor(key, cycles) {
        this.key = key;
        this.cycles = cycles;
    }

    report() {
        process.stdout.write(`${this.key}: ${this.cycles}%\r`);
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

    report() {
        this.list.forEach((p) => {
            process.stdout.write(`${p.key}: ${p.cycles}`);
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
