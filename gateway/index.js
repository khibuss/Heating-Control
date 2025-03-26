const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express()
const { startMqttClient, getTemperatureData, getStatusActuators } = require('./mqttClient'); // Importa la connessione MQTT
const { getLastReading } = require('./dbService');
const { startTemperatureCheck } = require('./controllerActuator');


app.use(cors());
const port = 8000;

startMqttClient();
startTemperatureCheck();

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

app.use((req, res, next) => {
    res.status(404).send(`The route ${req.originalUrl} does not exist`)
});

