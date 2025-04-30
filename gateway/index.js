const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express()

const { startMqttClient, getStatusActuators, publish_single_updateActuator } = require('./mqttClient'); // Importa la connessione MQTT
const { getLastSensorReading, getSensorsId} = require('./dbService');
const { startHeatingSystem, getAllActuators, setLowerThreshold, setUpperThreshold } = require('./controllerDevices');

app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Allow frontend to access backend

const port = 8000;

startMqttClient();
startHeatingSystem();

app.listen(port, () => {
    console.log("🚀 Server running on http://localhost:" + port);
});



app.get('/', (req, res) => res.send('Index of Heating Control'));

// Alla route /temperatures/sensor1 darà il valore di sensor1.
app.get('/temperatures/:idSensor', async (req, res) => {
    try {
        res.json(await getLastSensorReading(req.params.idSensor));
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});

// Funzione per ottenere i nomi (gli ID) di tutti i sensori.
// Servirà nel frontend per interrogare il db attraverso gli id.
app.get('/getSensorsId', async (req, res) => {
    try {
        res.json(await getSensorsId());
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});

app.get('/actuators/:idActuator', async (req, res) => {
    try {
        res.json(await getStatusActuators(req.params.idActuator));
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});

// API to get the list of actuators
app.get("/listActuators", (req, res) => {
    res.json(getAllActuators());
})


// API to update actuator status
app.post("/updateActuator", (req, res) => {
    console.log('Received update act:', req.body);
    const id = req.body.id;
    const stateDesired = req.body.stateDesired;

    const actuator = getAllActuators().find((a) => a.id === id);
    if (actuator) {
        publish_single_updateActuator(id, stateDesired);
        res.json({ success: true, receivedData: req.body });
    } else {
        res.status(404).json({ error: "Actuator not found" });
    }
});


/**
 * @route POST /thresholds/upper
 * @description Update the upper temperature threshold
 * @param {number} req.body.upperThreshold - New upper threshold
 * @returns {Object} 200 - Threshold updated successfully
 * @returns {Error} 400 - Invalid input
 */
app.post("/thresholds/upper", (req, res) => {
    const upperThreshold = req.body.upperThreshold;
    if (typeof upperThreshold !== 'number'){
        return res.status(400).json({error: "Invalid Threshold"});
    }

    setUpperThreshold(upperThreshold);
    res.status(200).json({message: "Upper threshold updated", upperThreshold});
});

/**
 * @route POST /thresholds/lower
 * @description Update the lower temperature threshold
 * @param {number} req.body.lowerThreshold - New lower threshold
 * @returns {Object} 200 - Threshold updated successfully
 * @returns {Error} 400 - Invalid input
 */
app.post("/thresholds/lower", (req, res) => {
    const lowerThreshold = req.body.lowerThreshold;
    if (typeof lowerThreshold !== 'number'){
        return res.status(400).json({error: "Invalid Threshold"});
    }

    setLowerThreshold(lowerThreshold);
    res.status(200).json({message: "Lower threshold updated", lowerThreshold});
});

app.use((req, res, next) => {
    res.status(404).send(`The route ${req.originalUrl} does not exist`)
});

