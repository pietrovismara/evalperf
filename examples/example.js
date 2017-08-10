const findClosestPoint = require('./find-closest-point');
const {perfPar, perf} = require('../index');
const path = require('path');
const readline = require('readline');

const refPoint = [-86.67, 36.12];

let points = new Array(100000)
    .fill(1)
    .map(p => [getRandomInRange(-180, 180, 5), getRandomInRange(-90, 90, 5)]);


parallel()
.then(() => {    
    sequential();
});

function parallel() {
    console.log('===============================');
    console.log('Parallel Execution');
    const runner = perfPar();

    const lines = {'Js Closest Point': 0, 'Js Closest Point Clone': 1};
    let currLine = 0;

    return runner.setTest({
        key: 'Js Closest Point',
        modulePath: path.resolve(__dirname, './find-closest-point'),
        args: [refPoint, points]
    })
    .setTest({
        key: 'Js Closest Point Clone',
        modulePath: path.resolve(__dirname, './find-closest-point'),
        args: [refPoint, points]
    })
    .on('testError', e => console.log(e))
    .start(75)
    .then(results => results.forEach(r => r.report()))
    .catch((err) => {
        console.log(err);
    });
}


function sequential() {
    console.log('===============================');
    console.log('Sequential Execution');
    const runner = perf();
    const iterations = 75;

    runner.setTest({
        key: 'Js Closest Point',
        fn: findClosestPoint,
        args: [refPoint, points]
    })
    .setTest({
        key: 'Js Closest Point Clone',
        fn: findClosestPoint,
        args: [refPoint, points]
    })
    .on('testStart', key => console.log(`Started ${key}`))
    .on('cycle', p => p.report())
    .on('testEnd', result => result.report())
    .on('testError', e => console.log(e));

    runner.start(iterations);
    console.log('===============================');
}


function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}
