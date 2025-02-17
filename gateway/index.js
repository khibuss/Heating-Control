const express = require('express');
const cors = require('cors');
const app = express()
const { startMqttClient, getTemperatureData } = require('./mqttClient'); // Importa la connessione MQTT

app.use(cors());
const port = 8000

app.listen(port, ()=> {
    console.log('Listening on port ' + port);
});

startMqttClient();
app.get('/', (req, res) => res.send('Index of Heating Control'));

app.get('/temperatures', (req, res) => {
    res.json({ message: getTemperatureData() });
});


app.use((req, res, next) => {
    res.status(404).send(`The route ${req.originalUrl} does not exist`)
});