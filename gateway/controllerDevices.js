/**
 * @file heatingSystem.js
 * @description Contiene la logica per la gestione del sistema di riscaldamento in base alle letture dei sensori.
 * Supporta modalità di funzionamento globale e per singolo sensore, e attiva/disattiva attuatori secondo le soglie configurate.
 */

const { publish_single_updateActuator } = require("./mqttClient");
const { getSensorsId, getAllActuators } = require("./dbService");
const { getLowerThreshold, getUpperThreshold } = require("./thresholdService");
const { loadConfiguration } = require("./configurationService");
const { getLastSensorReadingAveraged } = require("./utils");
const Notifier = require("./telegramService");

let configuration = loadConfiguration(); // Caricamento configurazione
let configurationDirty = false; // Flag per ricaricare la configurazione

/**
 * Segna la configurazione come "dirty" per forzarne la ricarica nel ciclo successivo.
 */
function markConfigurationDirty() {
  configurationDirty = true;
}

let lastAutoEvent = null;

function setLastAutoEvent(event) {
  lastAutoEvent = {
    timestamp: new Date().toISOString(),
    event,
  };
}

function getLastAutoEvent() {
  return lastAutoEvent;
}

/**
 * Calcola la temperatura media più recente da tutti i sensori disponibili.
 *
 * @async
 * @function getAverageTemperature
 * @returns {Promise<number|null>} Temperatura media o null se nessun dato è disponibile.
 */
async function getAverageTemperature() {
  const sensorsID = await getSensorsId();
  const temperatures = [];

  console.log(sensorsID);

  for (const sensor of sensorsID) {
    const lastRead = await getLastSensorReadingAveraged(sensor.id);

    if (!lastRead) {
      console.log(
        `⚠️ Nessuna lettura trovata per il sensore ${sensor.id}, dati non trovati nel DB oppure timestamp troppo vecchio`
      );
      continue;
    }

    temperatures.push(parseFloat(lastRead.temperature));
  }

  if (temperatures.length === 0) return null;

  const average =
    temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
  return average.toFixed(2);
}

/**
 * Avvia il ciclo principale del sistema di riscaldamento.
 * Verifica periodicamente le temperature e controlla gli attuatori.
 */
async function startHeatingSystem() {
  while (true) {
    try {
      if (configurationDirty) {
        configuration = loadConfiguration();
        configurationDirty = false;
        console.log("🔁 Configurazione ricaricata");
      }

      switch (configuration.mode) {
        case "global":
          await handleGlobalMode();
          break;
        case "single":
          await handleSingleMode(configuration.selectedSensor);
          break;
        default:
          console.log("Unknown mode");
          break;
      }
    } catch (err) {
      console.error("Errore nel ciclo del riscaldamento:", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

/**
 * Gestisce la modalità "global", basata sulla media delle temperature di tutti i sensori.
 */
async function handleGlobalMode() {
  const avgTemp = await getAverageTemperature();
  if (avgTemp != null) {
    checkTemperature(avgTemp);
  } else {
    console.log("No sensor data available yet.");
  }
}

/**
 * Gestisce la modalità "single", basata su un singolo sensore.
 */
async function handleSingleMode(idsens) {
  const lastReading = await getLastSensorReadingAveraged(idsens);
  if (lastReading && lastReading.temperature != null) {
    const temperature = parseFloat(lastReading.temperature);
    checkTemperature(temperature);
  } else {
    console.log("No sensor data detected for ", idsens);
  }
}

/**
 * Controlla se la temperatura supera le soglie e gestisce lo stato degli attuatori.
 *
 * @async
 * @function checkTemperature
 * @param {number} temperature - Temperatura da verificare
 */
async function checkTemperature(temperature) {
  const lower = getLowerThreshold();
  const upper = getUpperThreshold();

  console.log(`📊 Temperature compared: ${temperature}°C`);

  if (temperature < lower) {
    try {
      const allActuators = await getAllActuators();
      let changed = false;

      allActuators.forEach((actuator) => {
        if (!actuator["status"]) {
          publish_single_updateActuator(actuator.id, true);
          changed = true;
        }
      });

      if (changed) {
        Notifier.notify(
          "Heat Pumps Activated 🔥",
          `⚡ Temperature (${temperature}°C) is below the lower threshold (${lower}°C).`
        );
        console.log(
          `🔥 Attuatori attivati per temperatura sotto soglia (${lower}°C)`
        );
        setLastAutoEvent(
          `Attivazione automatica: ${temperature}°C sotto ${lower}°C`
        );
        changed = false;
      } else {
        console.log(`✔ Tutti gli attuatori erano già attivi`);
      }
    } catch (error) {
      console.error("❌ Errore attivazione attuatori:", error);
    }
  } else if (temperature > upper) {
    try {
      const allActuators = await getAllActuators();
      let changed = false;

      allActuators.forEach((actuator) => {
        if (actuator["status"]) {
          publish_single_updateActuator(actuator.id, false);
          changed = true;
        }
      });

      if (changed) {
        Notifier.notify(
          "Heat Pumps Deactivated ❄️",
          `⚡ Temperature (${temperature}°C) is above the upper threshold (${upper}°C).`
        );
        console.log(
          `❄️ Attuatori disattivati per temperatura sopra soglia (${upper}°C)`
        );
        setLastAutoEvent(
          `Disattivazione automatica: ${temperature}°C sopra ${upper}°C`
        );
        changed = false;
      } else {
        console.log(`✔ Tutti gli attuatori erano già spenti`);
      }
    } catch (error) {
      console.error("❌ Errore disattivazione attuatori:", error);
    }
  }
}

/**
 * Imposta manualmente la configurazione del sistema.
 *
 * @function setConfiguration
 * @param {string} newMode - Modalità ("global" o "single")
 * @param {string|null} sensorId - ID del sensore da utilizzare (solo in modalità "single")
 */
function setConfiguration(newMode, sensorId = null) {
  configuration.mode = newMode;
  configuration.selectedSensor = sensorId;

  console.log(`Mode set to: ${newMode}, Selected sensor: ${sensorId}`);
}

// Export dei metodi pubblici
module.exports = {
  startHeatingSystem,
  setConfiguration,
  getAverageTemperature,
  checkTemperature,
  markConfigurationDirty,
  getLastAutoEvent,
};
