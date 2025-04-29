const { publish_single_updateActuator } = require("./mqttClient");
const { getLastSensorReading, getSensorsId } = require("./dbService");

const LOWER_THRESHOLD_TEMP = 20; // Temperature upper limit to trigger actuators
const UPPER_THRESHOLD_TEMP = 40; // Temperature lower limit to trigger actuators

statusActs = false; //Variabile per lo stato di tutti gli attuatori

const ACTUATOR_THINGS = [{ id: "actuator1", status: "true" }, { id: "actuator2", status: "false" }, { id: "actuator3", status: "true" }];

const sensorData = [22, 10] // Valori momentanei da sostituire con quelli reali
let configuration = {
    mode: "single",
    selectedSensor: "sensor1",
};


async function getAverageTemperatureNew() {
    const sensorsID = await getSensorsId();
    console.log(sensorsID);
}
// Function to calculate average temperature of all sensors
function getAverageTemperature() {
    const temperatures = Object.values(sensorData);
    if (temperatures.length === 0) return null;

    const average = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    return average;
}

// Function to check temperatures at intervals
function startHeatingSystem() {

    setInterval(() => {
        // Gestione configurazione media globale
        if (configuration.mode === "global") {
            const avgTemp = getAverageTemperature();
            if (avgTemp != null) {
                checkTemperature(avgTemp);
            } else {
                console.log("⚠️ No sensor data available yet.");
            }
        }
        // Gestione configurazione singolo sensore
        else {
            temp = 30; //momentanea
            if (temp != null) {
                checkTemperature(temp);
            } else {
                console.log("⚠️ No sensor data detected.");
            }
        }
    }, 5000); // Check every 5 seconds
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
    startHeatingSystem, setConfiguration, getAllActuators, getAverageTemperature, getAverageTemperatureNew
};
