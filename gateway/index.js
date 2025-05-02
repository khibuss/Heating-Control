/**
 * @file index.js
 * @description Entry point del server backend per il sistema di controllo riscaldamento.
 * Gestisce API REST per sensori, attuatori, soglie di temperatura, e comunicazione MQTT.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 8000;

// Importazione dei moduli locali
const { startMqttClient, getStatusActuators, publish_single_updateActuator } = require('./mqttClient');
const { getLastSensorReading, getSensorsId, getAllActuators, getActuatorFromId } = require('./dbService');
const { startHeatingSystem, setLowerThreshold, setUpperThreshold } = require('./controllerDevices');
const { type } = require('os');

// Middleware globali
app.use(express.json()); // Analizza i body delle richieste come JSON
app.use(cors());         // Abilita CORS per richieste cross-origin

// Avvio dei servizi core
startMqttClient();       // Connessione al broker MQTT
startHeatingSystem();    // Avvio del sistema di controllo temperatura


app.listen(port, () => {
    console.log("🚀 Server running on http://localhost:" + port);
});

/**
 * @route GET /
 * @description Route di base per testare che il server sia attivo
 */
app.get('/', (req, res) => res.send('Index of Heating Control'));

/**
 * @route GET /temperatures/:idSensor
 * @description Ritorna l'ultima lettura del sensore specificato
 * @param {string} idSensor - ID del sensore da leggere
 * @returns {Object} Lettura sensore o errore
 */
app.get('/temperatures/:idSensor', async (req, res) => {
    try {
        res.json(await getLastSensorReading(req.params.idSensor));
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});

/**
 * @route GET /getSensorsId
 * @description Restituisce la lista degli ID di tutti i sensori registrati
 * @returns {Array<Object>} Lista dei sensori
 */
app.get('/getSensorsId', async (req, res) => {
    try {
        res.json(await getSensorsId());
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});

/**
 * @route GET /actuators/:idActuator
 * @description Ritorna le informazioni di un attuatore specifico
 * @param {string} idActuator - ID dell'attuatore
 * @returns {Object} Dati dell'attuatore o errore
 */
app.get('/actuators/:idActuator', async (req, res) => {
    try {
        res.json(await getActuatorFromId(req.params.idActuator));
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});

/**
 * @route GET /listActuators
 * @description Ritorna la lista di tutti gli attuatori registrati
 * @returns {Array<Object>} Lista degli attuatori
 */
app.get("/listActuators", async (req, res) => {
    try {
        res.json(await getAllActuators());
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving actuators');
    }
});

/**
 * @route POST /updateActuator
 * @description Aggiorna lo stato desiderato di un attuatore (accensione/spegnimento)
 * @param {string} req.body.id - ID dell'attuatore
 * @param {boolean} req.body.stateDesired - Stato desiderato (true = ON, false = OFF)
 * @returns {Object} Stato della richiesta
 */
app.post("/updateActuator", async (req, res) => {
    console.log('Received update act:', req.body);
    const { id, stateDesired } = req.body;

    if (typeof stateDesired !== 'boolean'){
        return res.status(400).json({ error: "Actuator desired state must be a boolean"})
    }
    try {
        const actuator = await getActuatorFromId(id);

        if (actuator) {
            publish_single_updateActuator(id, stateDesired);
            res.json({ success: true, receivedData: req.body });
        } else {
            res.status(404).json({ error: "Actuator not found" });
        }
    } catch (error) {
        console.error("Error updating actuator:", error);
        res.status(500).json({ error: "Internal server error" });
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

