// Questo per file per ora è inutilizzato ma servirà forse più avanti
const awsIot = require('aws-iot-device-sdk-v2');
const ACTUATOR_THINGS = ["actuator1", "actuator2"];

const mqttClient = new awsIot.mqtt.MqttClient();
const builder = awsIot.iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(
    "certificates/device-certificate.pem.crt",
    "certificates/device-private.pem.key"
);


builder.with_client_id("TemperatureReader");
builder.with_endpoint(process.env.AWS_ENDPOINT);

const connection = mqttClient.new_connection(builder.build());
let temperatureData = {};
let statusAct = {};
let isConnected = false;


// Funzione per avviare la connessione MQTT
function startMqttClient() {
    return connection.connect().then(() => {
        console.log("Connesso ad AWS IoT");

        isConnected = true;


        //I sensori e gli attuatori pubblicano il loro stato su shadow/update
        connection.subscribe('$aws/things/+/shadow/update', awsIot.mqtt.QoS.AtMostOnce, (topic, payload) => {
            const decoder = new TextDecoder('utf-8');
            const decodedPayload = decoder.decode(payload);
            console.log(`Ricevuto messaggio su ${topic}:`, decodedPayload);

            const thingName = topic.split("/")[2];
            if (topic.includes('/sensor')) {
                temperatureData[thingName] = decodedPayload;
            }
            if (topic.includes('actuator')) {
                statusAct[thingName] = decodedPayload;
            }
        });

        connection.subscribe('$aws/things/+/shadow/update/accepted', awsIot.mqtt.QoS.AtMostOnce, (topic, payload) => {
            const decoder = new TextDecoder('utf-8');
            const decodedPayload = decoder.decode(payload);
            temperatureData[topic] = decodedPayload;
            console.log(`Ricevuto messaggio su ${topic}:`, decodedPayload);
        });
    }).catch((err) => {
        console.error("Errore di connessione:", err);
    });
}

// Function to update the state of a single specified actuator
function publish_single_updateActuator(actName, power) {

    if (isConnected) {
        const shadowUpdate = {
            state: {
                desired: {
                    status: power ? "ON" : "OFF",
                },
            },
        };
        connection.publish(`$aws/things/${actName}/shadow/update`, JSON.stringify(shadowUpdate), awsIot.mqtt.QoS.AtMostOnce);

        console.log(`🚀 ${actName} turned ${power ? "ON" : "OFF"}`);
    }
}


function getStatusActuators(actId) {
    return statusAct[actId];
}

// Esportiamo le funzioni
module.exports = { startMqttClient, getStatusActuators, publish_single_updateActuator };

module.exports.closeConnection = () => {
    if (connection) {
      connection.disconnect();
    }
  };