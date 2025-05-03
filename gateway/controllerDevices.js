const { publish_single_updateActuator } = require("./mqttClient");
const { getLastSensorReading, getSensorsId, getAllActuators} = require("./dbService");

let LOWER_THRESHOLD_TEMP = 20; // Temperature LOWER limit to trigger actuators
let UPPER_THRESHOLD_TEMP = 40; // Temperature UPPER limit to trigger actuators

statusActs = false; //Variabile per lo stato di tutti gli attuatori

let configuration = {
    mode: "global",
    selectedSensor: "sensor1",
};


async function getAverageTemperature() {
    const sensorsID = await getSensorsId();
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
function startHeatingSystem() {
    setInterval(() => {
        switch (configuration.mode) {
            case "global":
                handleGlobalMode();
                break;
            case "single":
                handleSingleMode();
                break;
            default:
                console.log('Unknown mode');
                break;
        }
    }, 5000);
}

async function handleGlobalMode() {
    const avgTemp = await getAverageTemperature();
    if (avgTemp != null) {
        checkTemperature(avgTemp);
    } else {
        console.log("No sensor data available yet.");
    }
}

function handleSingleMode() {
    const temp = 30; // momentaneo
    if (temp != null) {
        checkTemperature(temp);
    } else {
        console.log("No sensor data detected.");
    }
}

async function checkTemperature(temperature) {
    console.log(`📊 Temperature compared: ${temperature}°C`);

    if (temperature < LOWER_THRESHOLD_TEMP && statusActs !== true) {
        console.log(`Temperature under lower threshold (${LOWER_THRESHOLD_TEMP}°C)! Activating actuators...`);
        statusActs = true;

        try {
            const allActuators = await getAllActuators(); // wait for data
            allActuators.forEach(actuator =>
                publish_single_updateActuator(actuator.id, true)
            );
        } catch (error) {
            console.error("Failed to activate actuators:", error);
        }

    } else if (temperature > UPPER_THRESHOLD_TEMP && statusActs !== false) {
        console.log(`🔥 Temperature over upper threshold (${UPPER_THRESHOLD_TEMP}°C)! Disactivating actuators...`);
        statusActs = false;
        
        const allActuators = await getAllActuators(); // wait for data
        allActuators.forEach(actuator =>
            publish_single_updateActuator(actuator.id, false)
        );
    }
}


function setUpperThreshold(threshold) {
    UPPER_THRESHOLD_TEMP = threshold;
    console.log(`Upper threshold updated: ${UPPER_THRESHOLD_TEMP}°C`);
};

function setLowerThreshold(threshold) {
    LOWER_THRESHOLD_TEMP = threshold;
    console.log(`Lower threshold updated: ${LOWER_THRESHOLD_TEMP}°C`);
};

function setConfiguration(newMode, sensorId = null) {
    configuration.mode = newMode;
    configuration.selectedSensor = sensorId;

    console.log(`Mode set to: ${mode}, Selected sensor: ${selectedSensor}`);
}



// Export function to start monitoring
module.exports = {
    startHeatingSystem, setConfiguration, getAverageTemperature, setLowerThreshold, setUpperThreshold, checkTemperature
};
