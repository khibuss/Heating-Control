const AWS = require('aws-sdk');
const config = require('./config');
// Setting the configurations
AWS.config.update(config.dynamodb_aws_remote_config);
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Fetch dell'ultima lettura di ciascun sensore. (risolto ora prende l'ultima)
const getLastSensorReading = async (sensorId) => {
    const params = {
        TableName: config.dynamodb_aws_SensorReadings,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": sensorId
        },
        ScanIndexForward: false,
        Limit: 1 // Prendi solo il primo risultato
    };

    try {
        const data = await dynamoDB.query(params).promise();
        return data.Items[0] || null;
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        throw error;
    }
};

const getSensorsId = async () => {
    const params = {
        TableName: config.dynamodb_aws_SensorRegistry,
    }

    try {
        const data = await dynamoDB.scan(params).promise();
        return data.Items || null;

    } catch (error) {
        console.error('Error fetching sensor names:', error);
        throw error;
    }
};


module.exports = { getLastSensorReading, getSensorsId };