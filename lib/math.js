module.exports = {
    average: average,
    standardDeviation: standardDeviation
};

function average(numbers) {
    const tot = numbers.reduce((total, num) => {
        return total + num;
    }, 0);

    return (tot / numbers.length).toFixed(2);
}

function standardDeviation(numbers, avg) {    
    const sqrdDiffs = numbers.map(num => Math.pow(num - avg, 2));

    return Math.sqrt(average(sqrdDiffs)).toFixed(2);
}
