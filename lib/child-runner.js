const perf = require('./evalperf');

process.on('message', onMessage);

process.on('uncaughtException', (e) => {
    process.send({
        event: 'testError',
        data: e
    });
});

function onMessage(m) {
    const {key, modulePath, method} = m.testData;
    const mod = require(modulePath);
    const runner = perf(false);
    let args;
    if (m.testData.args.serialized) {
        args = m.testData.args.values.map((arg, i) => {
            if (m.testData.args.serialized.indexOf(i) !== -1) {
                return eval(arg);
            }

            return arg;
        });
    } else {
        args = m.testData.args;
    }

    runner.setTest({
        key: key,
        fn: method ? mod[method] : mod,
        args: args
    })
    .on('testStart', (key) => {
        process.send({
            event: 'testStart',
            data: key
        });
    })
    .on('cycle', (progress) => {
        process.send({
            event: 'cycle',
            data: progress
        });
    }).on('testEnd', (result) => {
        process.send({
            event: 'testEnd',
            data: result
        });
    })
    .on('testError', (e) => {
        process.send({
            event: 'testError',
            data: {
                message: e.message,
                stack: e.stack
            }
        });
    });

    runner.start(m.iterations);
}
