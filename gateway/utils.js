const {getLastFiveSensorReadings} = require('./dbService');
function checkValidTimestamp(reading) {
    const secondsAgo = 60;
    const now = Math.floor(Date.now() / 1000);
    return parseInt(reading.timestamp) > now - secondsAgo;
}

function calculateAverages(readings) {
    const count = readings.length;
    const total = readings.reduce(
        (acc, r) => {
            acc.humidity += r.humidity;
            acc.temperature += parseFloat(r.temperature);
            return acc;
        },
        { humidity: 0, temperature: 0 }
    );

    return {
        location: readings[0].location,
        id: readings[0].id,
        timestamp: readings[0].timestamp,
        humidity: total.humidity / count,
        temperature: parseFloat(total.temperature / count).toFixed(2),
        ttl: readings[0].ttl
    };
}

async function getLastSensorReadingAveraged(idSensor) {
    const lastReadings = await getLastFiveSensorReadings(idSensor);

        if (!lastReadings || lastReadings.length === 0 || !checkValidTimestamp(lastReadings[4])) {
            return null;
        }

        const average = calculateAverages(lastReadings);
        return average;
}

// Export function 
module.exports = {
    checkValidTimestamp, calculateAverages, getLastSensorReadingAveraged
};
