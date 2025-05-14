/**
 * @file dbService.js
 * @description Servizi per l'interazione con DynamoDB (sensori e attuatori).
 * Fornisce funzioni per ottenere l'ultima lettura di un sensore,
 * la lista dei sensori registrati e la lista degli attuatori.
 */

const AWS = require("aws-sdk");
const config = require("./config");

AWS.config.update(config.dynamodb_aws_remote_config);

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Recupera le ultime cinque letture di un sensore specifico (ordinamento decrescente per timestamp).
 *
 * @async
 * @function getLastFiveSensorReadings
 * @param {string} sensorId - ID del sensore da interrogare
 * @returns {Array<Object>|null} - Array di letture del sensore, oppure null se non trovate
 */
const getLastFiveSensorReadings = async (sensorId) => {
  const params = {
    TableName: config.dynamodb_aws_SensorReadings,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": sensorId,
    },
    ScanIndexForward: false, // Ordina in modo decrescente (timestamp più recente per primo)
    Limit: 5, // Prende le ultime 5
  };

  try {
    const data = await dynamoDB.query(params).promise();

    if (data.Items.length === 5) return data.Items;
    else return null; // Se non ci sono almeno 5 record
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    throw error;
  }
};

/**
 * Restituisce la lista di tutti gli ID dei sensori registrati nel sistema.
 *
 * @async
 * @function getSensorsId
 * @returns {Array<Object>|null} - Array di id sensori o null in caso di errore
 */
const getSensorsId = async () => {
  const params = {
    TableName: config.dynamodb_aws_SensorRegistry,
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    return data.Items || null;
  } catch (error) {
    console.error("Error fetching sensor names:", error);
    throw error;
  }
};

/**
 * Restituisce la lista di tutti gli attuatori registrati nel sistema.
 *
 * @async
 * @function getAllActuators
 * @returns {Array<Object>|null} - Array di oggetti attuatori o null in caso di errore
 */
const getAllActuators = async () => {
  const params = {
    TableName: config.dynamodb_aws_ActuatorRegistry,
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    return data.Items || null;
  } catch (error) {
    console.error("Error fetching actuator names:", error);
    throw error;
  }
};

/**
 * Restituisce i dati di un attuatore tramite id
 *
 * @async
 * @function getActuatorFromId
 * @returns {Object|null} - L'attuatore o null in caso di errore
 */
const getActuatorFromId = async (actuatorId) => {
  const params = {
    TableName: config.dynamodb_aws_ActuatorRegistry,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": actuatorId,
    },
  };

  try {
    const data = await dynamoDB.query(params).promise();
    return data.Items[0] || null;
  } catch (error) {
    console.error("Error fetching actuator names:", error);
    throw error;
  }
};

// Esportazione delle funzioni per utilizzo esterno
module.exports = {
  getLastFiveSensorReadings,
  getSensorsId,
  getAllActuators,
  getActuatorFromId,
};
