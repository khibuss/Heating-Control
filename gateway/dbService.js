const AWS = require('aws-sdk');
const config = require('./config');
// Setting the configurations
AWS.config.update(config.dynamodb_aws_remote_config);
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Fetch dell'ultima lettura di ciascun sensore. DA CAMBIARE! PRENDE SOLO UNA NON L'ULTIMA!
const getLastReading = async (sensorId) => {
    const params = {
        TableName: config.dynamodb_aws_table_name,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": sensorId
        },
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
module.exports = { getLastReading };