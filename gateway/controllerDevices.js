const { publish_single_updateActuator } = require("./mqttClient");
const { getLastSensorReading, getSensorsId, getAllActuators} = require("./dbService");
const {
    getLowerThreshold,
    getUpperThreshold,
    setLowerThreshold,
    setUpperThreshold
} = require('./thresholdService');
const {loadConfiguration, saveConfiguration} = require("./configurationService");

statusActs = false; //Variabile per lo stato di tutti gli attuatori

let configuration = loadConfiguration();


async function getAverageTemperature() {
    const sensorsID = await getSensorsId();
    console.log(sensorsID);
    temperatures = [];
    for (const sensor of sensorsID) {
        const lastRead = await getLastSensorReading(sensor.id);
        temperatures.push(parseFloat(lastRead.temperature))
    }
    if (temperatures.length === 0) return null;

    const average = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    return average;
}

// Main function that checks temperatures.
async function startHeatingSystem() {
    while (true) {
        try {
            switch (configuration.mode) {
                case "global":
                    await handleGlobalMode();
                    break;
                case "single":
                    await handleSingleMode();
                    break;
                default:
                    console.log('Unknown mode');
                    break;
            }
        } catch (err) {
            console.error("Errore nel ciclo del riscaldamento:", err);
        }

        // Attendi 5 secondi prima del prossimo ciclo
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

async function handleGlobalMode() {
    const avgTemp = await getAverageTemperature();
    if (avgTemp != null) {
        checkTemperature(avgTemp);
    } else {
        console.log("No sensor data available yet.");
    }
}

async function handleSingleMode() {
    const temp = 30; // momentaneo
    if (temp != null) {
        checkTemperature(temp);
    } else {
        console.log("No sensor data detected.");
    }
}

async function checkTemperature(temperature) {
    const lower = getLowerThreshold();
    const upper = getUpperThreshold();

    console.log(`📊 Temperature compared: ${temperature}°C`);

    if (temperature < lower && statusActs !== true) {
        console.log(`Temperature under lower threshold (${lower}°C)! Activating actuators...`);
        statusActs = true;

        try {
            const allActuators = await getAllActuators(); // wait for data
            allActuators.forEach(actuator =>
                publish_single_updateActuator(actuator.id, true)
            );
        } catch (error) {
            console.error("Failed to activate actuators:", error);
        }

    } else if (temperature > upper && statusActs !== false) {
        console.log(`🔥 Temperature over upper threshold (${upper}°C)! Disactivating actuators...`);
        statusActs = false;
        
        const allActuators = await getAllActuators(); // wait for data
        allActuators.forEach(actuator =>
            publish_single_updateActuator(actuator.id, false)
        );
    }
}

function setConfiguration(newMode, sensorId = null) {
    configuration.mode = newMode;
    configuration.selectedSensor = sensorId;

    console.log(`Mode set to: ${mode}, Selected sensor: ${selectedSensor}`);
}



// Export function to start monitoring
module.exports = {
    startHeatingSystem, setConfiguration, getAverageTemperature, checkTemperature
};
