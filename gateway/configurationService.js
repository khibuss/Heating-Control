const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'data/configuration.json');

const defaultConfiguration = {
    mode: "global",
    selectedSensor: ""
};

function loadConfiguration() {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        saveConfiguration(defaultConfiguration);
        return defaultConfiguration;
    }
}

function saveConfiguration(config) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(config, null, 2));
}

module.exports = {
    saveConfiguration, loadConfiguration
};
