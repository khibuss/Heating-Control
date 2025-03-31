const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express()

const { startMqttClient, getTemperatureData, getStatusActuators, publish_single_updateActuator } = require('./mqttClient'); // Importa la connessione MQTT
const { getLastReading } = require('./dbService');
const { startHeatingSystem, getAllActuators } = require('./controllerActuator');

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
        res.json(await getLastReading(req.params.idSensor));
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});

app.get('/sensorData/:idSensor', async (req, res) => {
    try {
        res.json(await getTemperatureData(req.params.idSensor));
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});

app.get('/statusAct/:idAct', async (req, res) => {
    try {
        res.json(await getStatusActuators(req.params.idAct));
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});

// API to get the list of actuators
app.get("/listActuators", (req, res) => {
    res.json(getAllActuators());
})

// app.post('/centralActuators', (req, res) => {
//     console.log('Received update act:', req.body);

//     publish_central_updateActuator(req.body.stateDesired);
//     res.json({ success: true, receivedData: req.body });
// });

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

app.use((req, res, next) => {
    res.status(404).send(`The route ${req.originalUrl} does not exist`)
});

