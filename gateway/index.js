/**
 * @file index.js
 * @description Entry point del server backend per il sistema di controllo riscaldamento.
 * Gestisce API REST per sensori, attuatori, soglie di temperatura, e comunicazione MQTT.
 */

const Notifier = require('./telegramService');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 8000;

// Importazione dei moduli locali
const { startMqttClient, publish_single_updateActuator } = require('./mqttClient');
const { getLastFiveSensorReadings, getSensorsId, getAllActuators, getActuatorFromId } = require('./dbService');
const { startHeatingSystem, markConfigurationDirty } = require('./controllerDevices');
const { setLowerThreshold, setUpperThreshold } = require("./thresholdService"); 
const { authenticateToken } = require('./middleware/authentication'); // Import del middleware
const { checkValidTimestamp, calculateAverages, getLastSensorReadingAveraged } = require('./utils')

// Middleware globali
app.use(express.json()); // Analizza i body delle richieste come JSON
app.use(cors());         // Abilita CORS per richieste cross-origin

// Avvio dei servizi core
startMqttClient();       // Connessione al broker MQTT
startHeatingSystem();    // Avvio del sistema di controllo temperatura


app.listen(port, () => {
    console.log("🚀 Server running on http://localhost:" + port);
});

// app.use((req, res, next) => {
//     if (req.path === '/login' || req.path === '/api/validate-token') {
//         return next(); // lascia passare il login e la validazione
//     }
//     authenticateToken(req, res, next); // protegge tutto il resto
// });

/**
 * @route GET /
 * @description Route di base per testare che il server sia attivo
 */
app.get('/', (req, res) => res.send('Index of Heating Control'));

/**
 * @route POST /login
 * @description Fornisce il JWT in seguito ad autenticazione
 * @param {string} req.body.username - Username inserito
 * @param {string} req.body.password - Password inserita
 * @returns {Object} JSON con JWT firmato
 * @returns {Error} 401 - Invalid Credentials
 */
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (username !== process.env.ADMIN_USER) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const match = await bcrypt.compare(password, process.env.ADMIN_PASS_HASH);
    if (!match) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = jwt.sign({ user: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({"token": token });
});

// Endpoint per la validazione del token
app.get('/api/validate-token', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Estrae il token da "Bearer <token>"

    if (!token) {
        return res.status(401).json({ valid: false, message: 'Token mancante' });
    }

    try {
        // Verifica il token usando il tuo JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.error("decoded: ", decoded);
        // Controllo aggiuntivo: verifica che il token appartenga all'admin (opzionale)
        if (decoded.user !== process.env.ADMIN_USER) {
            throw new Error('Utente non autorizzato');
        }

        // Token valido
        res.status(200).json({ valid: true, user: decoded.user });
    } catch (error) {
        // Token scaduto o invalido
        res.status(401).json({ valid: false, message: 'Token non valido' });
    }
});
/**
 * @route GET /temperatures/:idSensor
 * @description Ritorna l'ultima lettura del sensore specificato
 * @param {string} idSensor - ID del sensore da leggere
 * @returns {Object} Lettura sensore o errore
 */
app.get('/temperatures/:idSensor', async (req, res) => {
    try {
        const lastReadingAveraged = await getLastSensorReadingAveraged(req.params.idSensor);

        if (!lastReadingAveraged) {
            return res.json({
                id: req.params.idSensor,
                disconnected: true,
                message: "Sensore disconnesso"
            });
        }

        res.json({
            ...lastReadingAveraged,
            disconnected: false
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Errore nel recupero dei dati');
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
        const actuators = await getAllActuators();

        const nowInSeconds = Math.floor(Date.now() / 1000);
        const ONE_MINUTE = 60;

        const enrichedActuators = actuators.map(act => {
            const isDisconnected = (nowInSeconds - act.lastSeen) > ONE_MINUTE;

            return {
                ...act,
                connectionStatus: isDisconnected ? "disconnected" : "connected"
            };
        });
        res.json(enrichedActuators);
        
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
            Notifier.notify(
                '⚡ Manual Control',
                `Heat pump in ${actuator.location} has been manually ${stateDesired ? "activated 🔥" : "deactivated ❄️"}.`
            );

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

/**
 * @route POST /configuration
 * @description Aggiorna la configurazione del sistema (modalità e sensore selezionato)
 * @param {string} req.body.mode - Modalità di funzionamento ("global" o "single")
 * @param {string} [req.body.selectedSensor] - ID del sensore (obbligatorio se mode è "single")
 * @returns {Object} 200 - Configurazione aggiornata correttamente
 * @returns {Error} 400 - Input non valido
 */
app.post("/configuration", (req, res) => {
    const { mode, selectedSensor } = req.body;

    if (mode !== "global" && mode !== "single") {
        return res.status(400).json({ error: "Invalid mode. Must be 'global' or 'single'." });
    }

    if (mode === "single" && (!selectedSensor || typeof selectedSensor !== 'string')) {
        return res.status(400).json({ error: "selectedSensor is required in 'single' mode." });
    }

    const newConfig = {
        mode,
        selectedSensor: mode === "single" ? selectedSensor : ""
    };

    saveConfiguration(newConfig);
    markConfigurationDirty(); // forza il reload nel ciclo di controllo

    res.status(200).json({ message: "Configuration updated", configuration: newConfig });
});

app.use((req, res, next) => {
    res.status(404).send(`The route ${req.originalUrl} does not exist`)
});

