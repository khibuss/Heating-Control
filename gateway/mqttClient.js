const awsIot = require('aws-iot-device-sdk-v2');
const dotenv = require('dotenv');
dotenv.config();

const mqttClient = new awsIot.mqtt.MqttClient();
const builder = awsIot.iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(
    "certificates/device-certificate.pem.crt",
    "certificates/device-private.pem.key"
);

builder.with_client_id("TemperatureReader");
builder.with_endpoint(process.env.AWS_ENDPOINT);

const connection = mqttClient.new_connection(builder.build());
let temperatureData = {};

// Funzione per avviare la connessione MQTT
function startMqttClient() {
    return connection.connect().then(() => {
        console.log("Connesso ad AWS IoT");

        connection.subscribe('sensors/temperature/+', awsIot.mqtt.QoS.AtMostOnce, (topic, payload) => {
            const decoder = new TextDecoder('utf-8');
            const decodedPayload = decoder.decode(payload);
            temperatureData[topic] = decodedPayload;
            console.log(`Ricevuto messaggio su ${topic}:`, decodedPayload);
        });
    }).catch((err) => {
        console.error("Errore di connessione:", err);
    });
}

// Funzione per ottenere i dati
function getTemperatureData() {
    return temperatureData;
}

// Esportiamo le funzioni
module.exports = { startMqttClient, getTemperatureData };
