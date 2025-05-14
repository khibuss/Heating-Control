/**
 * @file index.js
 * @description Entry point del server backend per il sistema di controllo riscaldamento.
 * Gestisce API REST per sensori, attuatori, soglie di temperatura, e comunicazione MQTT.
 */

const Notifier = require("./telegramService");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = 8000;

// Importazione dei moduli locali
const {
  startMqttClient,
  publish_single_updateActuator,
} = require("./mqttClient");
const {
  getLastFiveSensorReadings,
  getSensorsId,
  getAllActuators,
  getActuatorFromId,
} = require("./dbService");
const {
  startHeatingSystem,
  markConfigurationDirty,
  getAverageTemperature,
  getInfoActivation,
} = require("./controllerDevices");
const {
  saveConfiguration,
  loadConfiguration,
} = require("./configurationService");
const {
  setLowerThreshold,
  setUpperThreshold,
  getLowerThreshold,
  getUpperThreshold,
} = require("./thresholdService");
const { authenticateToken } = require("./middleware/authentication"); // Import del middleware
const {
  checkValidTimestamp,
  calculateAverages,
  getLastSensorReadingAveraged,
} = require("./utils");

// Middleware globali
app.use(express.json()); // Analizza i body delle richieste come JSON
app.use(cors()); // Abilita CORS per richieste cross-origin

// Avvio dei servizi core
startMqttClient(); // Connessione al broker MQTT
startHeatingSystem(); // Avvio del sistema di controllo temperatura

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
app.get("/", (req, res) => res.send("Index of Heating Control"));

/**
 * @route POST /login
 * @description Fornisce il JWT in seguito ad autenticazione
 * @param {string} req.body.username - Username inserito
 * @param {string} req.body.password - Password inserita
 * @returns {Object} JSON con JWT firmato
 * @returns {Error} 401 - Invalid Credentials
 */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username !== process.env.ADMIN_USER) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const match = await bcrypt.compare(password, process.env.ADMIN_PASS_HASH);
  if (!match) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = jwt.sign({ user: username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token: token });
});

// Endpoint per la validazione del token
app.get("/api/validate-token", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Estrae il token da "Bearer <token>"

  if (!token) {
    return res.status(401).json({ valid: false, message: "Token mancante" });
  }

  try {
    // Verifica il token usando il tuo JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.error("decoded: ", decoded);
    // Controllo aggiuntivo: verifica che il token appartenga all'admin (opzionale)
    if (decoded.user !== process.env.ADMIN_USER) {
      throw new Error("Utente non autorizzato");
    }

    // Token valido
    res.status(200).json({ valid: true, user: decoded.user });
  } catch (error) {
    // Token scaduto o invalido
    res.status(401).json({ valid: false, message: "Token non valido" });
  }
});
/**
 * @route GET /temperatures/:idSensor
 * @description Ritorna l'ultima lettura del sensore specificato
 * @param {string} idSensor - ID del sensore da leggere
 * @returns {Object} Lettura sensore o errore
 */
app.get("/temperatures/:idSensor", async (req, res) => {
  try {
    const lastReadingAveraged = await getLastSensorReadingAveraged(
      req.params.idSensor
    );

    if (!lastReadingAveraged) {
      return res.json({
        id: req.params.idSensor,
        disconnected: true,
        message: "Sensore disconnesso",
      });
    }

    res.json({
      ...lastReadingAveraged,
      disconnected: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Errore nel recupero dei dati");
  }
});

/**
 * @route GET /getSensorsId
 * @description Restituisce la lista degli ID di tutti i sensori registrati
 * @returns {Array<Object>} Lista dei sensori
 */
app.get("/getSensorsId", async (req, res) => {
  try {
    res.json(await getSensorsId());
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving data");
  }
});

/**
 * @route GET /actuators/:idActuator
 * @description Ritorna le informazioni di un attuatore specifico
 * @param {string} idActuator - ID dell'attuatore
 * @returns {Object} Dati dell'attuatore o errore
 */
app.get("/actuators/:idActuator", async (req, res) => {
  try {
    res.json(await getActuatorFromId(req.params.idActuator));
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving data");
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
    const MAX_TIME = 10;

    const enrichedActuators = actuators.map((act) => {
      const isDisconnected = nowInSeconds - act.lastSeen > MAX_TIME;

      return {
        ...act,
        connectionStatus: isDisconnected ? "disconnected" : "connected",
      };
    });
    res.json(enrichedActuators);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving actuators");
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
  console.log("Received update act:", req.body);
  const { id, stateDesired } = req.body;

  if (typeof stateDesired !== "boolean") {
    return res
      .status(400)
      .json({ error: "Actuator desired state must be a boolean" });
  }
  try {
    const actuator = await getActuatorFromId(id);

    if (actuator) {
      publish_single_updateActuator(id, stateDesired);
      Notifier.notify(
        "⚡ Manual Control",
        `Heat pump in ${actuator.location} has been manually ${
          stateDesired ? "activated 🔥" : "deactivated ❄️"
        }.`
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

app.post("/configuration", (req, res) => {
  const { lower, upper, mode, selectedSensor } = req.body;

  // Validazione soglie
  if (typeof lower !== "number" || typeof upper !== "number") {
    return res.status(400).json({ error: "Invalid thresholds" });
  }

  if (lower >= upper) {
    return res
      .status(400)
      .json({ error: "Lower threshold must be less than upper threshold." });
  }

  // Validazione configurazione
  if (mode !== "global" && mode !== "single") {
    return res
      .status(400)
      .json({ error: "Invalid mode. Must be 'global' or 'single'." });
  }

  if (
    mode === "single" &&
    (!selectedSensor || typeof selectedSensor !== "string")
  ) {
    return res
      .status(400)
      .json({ error: "selectedSensor is required in 'single' mode." });
  }

  // Esegui aggiornamenti
  setLowerThreshold(lower);
  setUpperThreshold(upper);

  const newConfig = {
    mode,
    selectedSensor: mode === "single" ? selectedSensor : "",
  };

  saveConfiguration(newConfig);
  markConfigurationDirty(); // forza il reload nel ciclo di controllo

  res.status(200).json({
    message: "Configuration and thresholds updated successfully",
    configuration: newConfig,
    thresholds: { lower, upper },
  });
});

/**
 * @route GET /configuration
 * @description Ottieni configurazione corrente e soglie
 * @returns {Object} 200 - Oggetto con lower, upper, mode, selectedSensor
 */
app.get("/getConfiguration", (req, res) => {
  try {
    const configuration = loadConfiguration();
    const lower = getLowerThreshold();
    const upper = getUpperThreshold();

    res.status(200).json({
      lower,
      upper,
      mode: configuration.mode,
      selectedSensor: configuration.selectedSensor || "",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load configuration" });
  }
});

app.get("/getAvgTemp", async (req, res) => {
  try {
    const avg_temp = await getAverageTemperature();
    console.log("Hey", avg_temp);
    res.status(200).json({
      avg_temp,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get average temperature" });
  }
});

app.get("/getInfoActivation", (req, res) => {
  try {
    const [automaticActivation, automaticDeactivation] = getInfoActivation();
    res.status(200).json({
      automaticActivation,
      automaticDeactivation,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to get info" });
  }
});

app.use((req, res, next) => {
  res.status(404).send(`The route ${req.originalUrl} does not exist`);
});
