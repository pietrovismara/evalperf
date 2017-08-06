var atan2 = Math.atan2
var cos = Math.cos
var sin = Math.sin
var sqrt = Math.sqrt
var PI = Math.PI

// (mean) radius of Earth (meters)
var R = 6378137

function squared(x) {
    return x * x
}

function toRad(x) {
    return x * PI / 180.0
}

// https://stackoverflow.com/questions/1502590/calculate-distance-between-two-points-in-google-maps-v3
module.exports = function findClosest(refPoint, points) {
    return points.map((p, i) => {
        return {
            id: i,            
            distance: haversineDistance(refPoint, p)
        };
    }).sort((a, b) => a.distance - b.distance )[0];
}


function haversineDistance(a, b) {
    const [aLng, aLat] = a;
    const [bLng, bLat] = b;

    var dLat = toRad(bLat - aLat)
    var dLon = toRad(bLng - aLng)

    var f = squared(sin(dLat / 2.0)) + cos(toRad(aLat)) * cos(toRad(bLat)) * squared(sin(dLon / 2.0))
    var c = 2 * atan2(sqrt(f), sqrt(1 - f))

    return R * c
}
