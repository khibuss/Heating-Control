const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'data/thresholds.json');

const defaultThresholds = {
    lower: 18,
    upper: 24
};

function loadThresholds() {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        saveThresholds(defaultThresholds);
        return defaultThresholds;
    }
}

function saveThresholds(thresholds) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(thresholds, null, 2));
}

function getLowerThreshold() {
    return loadThresholds().lower;
}

function getUpperThreshold() {
    return loadThresholds().upper;
}

function setLowerThreshold(newLower) {
    const thresholds = loadThresholds();
    thresholds.lower = newLower;
    saveThresholds(thresholds);
}

function setUpperThreshold(newUpper) {
    const thresholds = loadThresholds();
    thresholds.upper = newUpper;
    saveThresholds(thresholds);
}

module.exports = {
    getLowerThreshold,
    getUpperThreshold,
    setLowerThreshold,
    setUpperThreshold
};
