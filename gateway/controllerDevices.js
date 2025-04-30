const { publish_single_updateActuator } = require("./mqttClient");
const { getLastSensorReading, getSensorsId } = require("./dbService");

let LOWER_THRESHOLD_TEMP = 20; // Temperature upper limit to trigger actuators
let UPPER_THRESHOLD_TEMP = 40; // Temperature lower limit to trigger actuators

statusActs = false; //Variabile per lo stato di tutti gli attuatori

const ACTUATOR_THINGS = [{ id: "actuator1", status: "true" }, { id: "actuator2", status: "false" }, { id: "actuator3", status: "true" }];

let configuration = {
    mode: "single",
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

function handleGlobalMode() {
    const avgTemp = getAverageTemperature();
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

function checkTemperature(temperature) {

    console.log(`📊 Temperature compared: ${temperature.toFixed(2)}°C`);

    // Controlla la temperatura passata come parametro e la confronta con le soglie; se questa è al di sotto del lower threshold
    // e gli attuatori sono spenti, allora viene mandata la richiesta per accenderli; se questa è al di sopra dell'upper threshold 
    // e gli attuatori sono accesi, allora viene mandata la richiesta per spegnerli; 
    if (temperature < LOWER_THRESHOLD_TEMP && statusActs != true) {
        console.log(`Temperature under lower threshold (${LOWER_THRESHOLD_TEMP}°C)! Activating actuators...`);
        statusActs = true;
        //publish_central_updateActuator(true);
        ACTUATOR_THINGS.forEach(actuator => publish_single_updateActuator(actuator.id, true))

    }
    else {
        if (temperature > UPPER_THRESHOLD_TEMP && statusActs != false) {
            console.log(`🔥 Temperature over upper threshold (${UPPER_THRESHOLD_TEMP}°C)!. Disactivating actuators...`);
            statusActs = false;
            //publish_central_updateActuator(false);
            ACTUATOR_THINGS.forEach(actuator => publish_single_updateActuator(actuator.id, false))
        }
        else {
            //console.log(`No action`);

        }
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

function getAllActuators() {
    return ACTUATOR_THINGS;
}



// Export function to start monitoring
module.exports = {
    startHeatingSystem, setConfiguration, getAllActuators, getAverageTemperature, setLowerThreshold, setUpperThreshold
};
