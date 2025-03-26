const { send_central_updateActuator, test } = require("./mqttClient");

const LOWER_THRESHOLD_TEMP = 20; // Temperature upper limit to trigger actuators
const UPPER_THRESHOLD_TEMP = 40; // Temperature lower limit to trigger actuators

statusActs = false; //Variabile per lo stato di tutti gli attuatori

const sensorData = [22, 10] // Valori momentanei da sostituire con quelli reali
const configuration = {
    type: "single",
    sensorReference: "sensor1",
};

// Function to calculate average temperature of all sensors
function getAverageTemperature() {
    const temperatures = Object.values(sensorData);
    if (temperatures.length === 0) return null;

    const average = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    return average;
}

// Function to check temperatures at intervals
function startTemperatureCheck() {

    setInterval(() => {
        if (configuration.type === "global") {
            const avgTemp = getAverageTemperature();
            if (avgTemp != null) {
                console.log(`📊 Average Temperature: ${avgTemp.toFixed(2)}°C`);

                // Controlla che la temperatura media; se questa è al di sotto del lower threshold e gli attuatori sono spenti, allora viene mandata
                // la richiesta per accenderli; se questa è al di sopra dell'upper threshold e gli attuatori sono accesi, allora viene mandata
                // la richiesta per spegnerli; 
                if (avgTemp < LOWER_THRESHOLD_TEMP && statusActs != true) {
                    console.log(`Under lower threshold (${LOWER_THRESHOLD_TEMP}°C)! Activating actuators...`);
                    statusActs = true;
                    send_central_updateActuator(true);

                }
                else {
                    if (avgTemp > UPPER_THRESHOLD_TEMP && statusActs != false) {
                        console.log(`🔥 Over upper threshold (${UPPER_THRESHOLD_TEMP}°C)!. Disactivating actuators.`);
                        statusActs = false;
                        send_central_updateActuator(false);
                    }
                    else {
                        console.log(`No action`);

                    }
                }


            } else {
                console.log("⚠️ No sensor data available yet.");
            }
        }
        else {
            sensorName = configuration.sensorReference;
            temp = 15; //momentanea

            if (temp < LOWER_THRESHOLD_TEMP && statusActs != true) {
                console.log(`Temperature of ${sensorName} under lower threshold (${LOWER_THRESHOLD_TEMP}°C)! Activating actuators...`);
                statusActs = true;
                send_central_updateActuator(true);

            }
            else {
                if (temp > UPPER_THRESHOLD_TEMP && statusActs != false) {
                    console.log(`🔥 Temperature of ${sensorName} over upper threshold (${UPPER_THRESHOLD_TEMP}°C)!. Disactivating actuators...`);
                    statusActs = false;
                    send_central_updateActuator(false);
                }
                else {
                    console.log(`No action`);

                }
            }
        }
    }, 5000); // Check every 5 seconds
}



// Export function to start monitoring
module.exports = {
    startTemperatureCheck,
};
