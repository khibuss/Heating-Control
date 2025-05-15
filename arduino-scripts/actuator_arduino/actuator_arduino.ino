#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <MQTT.h>
#include <ArduinoJson.h>
#include <time.h>
#include <Stepper.h>

#define emptyString String()

// Error handling functions
#include "errors.h"

// Configuration data
#include "configuration.h"

// Define MQTT port
const int MQTT_PORT = 8883;

// Define subscription and publication topics (on thing shadow)
const char MQTT_SUB_TOPIC[] = "$aws/things/" THINGNAME "/shadow/update/delta";
const char MQTT_PUB_TOPIC[] = "$aws/things/" THINGNAME "/shadow/update";


// Enable or disable summer-time
#ifdef USE_SUMMER_TIME_DST
uint8_t DST = 1;
#else
uint8_t DST = 0;
#endif

// Create Transport Layer Security (TLS) connection
WiFiClientSecure net;

// Load certificates
BearSSL::X509List cert(cacert);
BearSSL::X509List client_crt(client_cert);
BearSSL::PrivateKey key(privkey);

// Initialize MQTT client
MQTTClient client(1024); //buffer size 1024 to read long payload
unsigned long lastMs = 0;
time_t now;
time_t nowish = 1510592825;

const int revolution = 200; // Revolution steps
int motorStatus = 0; // state of the motor
Stepper stepper(revolution, D1, D2, D5, D6); // Initialize the stepper library on D1,D2,D5,D6


// Get time through Simple Network Time Protocol
void NTPConnect(void) {
  Serial.print("Setting time using SNTP");
  configTime(TIME_ZONE * 3600, DST * 3600, "pool.ntp.org", "time.nist.gov");
  now = time(nullptr);
  while (now < nowish) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("done!");
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  Serial.print("Current time: ");
  Serial.print(asctime(&timeinfo));
}

// MQTT management of incoming messages
void messageReceived(String &topic, String &payload) {
  Serial.println("Received message from: " + topic + " - " + payload);
  
  // Allocate a static or dynamic JSON document with enough capacity
  const size_t capacity = 512; 
  DynamicJsonDocument doc(capacity);

  // Safely parse the payload
  DeserializationError error = deserializeJson(doc, payload);

  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.f_str());
    return;
  }

  // Safely extract the "status" field
  if (doc["state"].containsKey("status")) {
    bool status = doc["state"]["status"];
    Serial.print("Desired Status: ");
    Serial.println(status ? "ON" : "OFF");
    motorStatus = (status ? 1 : 0);
    sendData();
  } else {
    Serial.println("No 'status' in message");
  }
  
  
}

// MQTT Broker connection
void connectToMqtt(bool nonBlocking = false) {
  Serial.print("MQTT connecting ");
  while (!client.connected()) {
    if (client.connect(THINGNAME)) {
      Serial.println("connected!");
      if (client.subscribe(MQTT_SUB_TOPIC))
          Serial.println("subscribed!");
      else
       lwMQTTErr(client.lastError());;
          
    } else {
      Serial.print("SSL Error Code: ");
      Serial.println(net.getLastSSLError());
      Serial.print("failed, reason -> ");
      lwMQTTErrConnection(client.returnCode());
      if (!nonBlocking) {
        Serial.println(" < try again in 5 seconds");
        delay(5000);
      } else {
        Serial.println(" <");
      }
    }
    if (nonBlocking) break;
  }
}

// Wi-Fi connection
void connectToWiFi(String init_str) {
  if (init_str != emptyString)
    Serial.print(init_str);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }
  if (init_str != emptyString)
    Serial.println("ok!");
}
void verifyWiFiAndMQTT(void) {
  connectToWiFi("Checking WiFi");
  connectToMqtt();
}

// MQTT management of outgoing messages
void sendData(void) {
  DynamicJsonDocument jsonBuffer(JSON_OBJECT_SIZE(3) + 100);
  JsonObject root = jsonBuffer.to<JsonObject>();
  JsonObject state = root.createNestedObject("state");
  JsonObject state_reported = state.createNestedObject("reported");

  if (motorStatus == 0){
    state_reported["status"] = false;
  }
  else{
    state_reported["status"] = true;
  }
  
  state_reported["location"] = LOCATION;

  Serial.printf("Sending [%s]: ", MQTT_PUB_TOPIC);
  serializeJson(root, Serial);
  Serial.println();
  char shadow[measureJson(root) + 1];
  serializeJson(root, shadow, sizeof(shadow));
  if (!client.publish(MQTT_PUB_TOPIC, shadow, false, 0))
    lwMQTTErr(client.lastError());
}

void setup() {
  Serial.begin(115200);
  delay(5000);
  Serial.println();
  stepper.setSpeed(80); // Set motor speed at 80 rpm

  
  WiFi.hostname(THINGNAME);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, pass);
  connectToWiFi(String("Trying to connect with SSID: ") + String(ssid));
  NTPConnect();
  net.setTrustAnchors(&cert);
  net.setClientRSACert(&client_crt, &key);
  client.begin(MQTT_HOST, MQTT_PORT, net);
  client.onMessage(messageReceived);
  connectToMqtt();
}

void loop() {

  now = time(nullptr);
  if (!client.connected()) {
    verifyWiFiAndMQTT();
  } else {
    client.loop();
    if (millis() - lastMs > PUBLISH_DELAY) {
      lastMs = millis();
      sendData();      
    }
  }
  stepper.step(motorStatus);  // Move motor
}