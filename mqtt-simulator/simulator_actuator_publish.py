import json
import os
import random
import threading
import time

import questionary
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
from dotenv import load_dotenv

# ==== Configurazione ====
load_dotenv(dotenv_path="../gateway/.env")

ENDPOINT = os.getenv("AWS_ENDPOINT")
CLIENT_ID = "ActuatorSimulator"

PATH_TO_CERT = "../gateway/certificates/device-certificate.pem.crt"
PATH_TO_KEY = "../gateway/certificates/device-private.pem.key"
PATH_TO_ROOT = "../gateway/certificates/root_CA1.pem"

PUBLISH_DELAY = 300  # in secondi


# ==== Connessione al broker MQTT ====
mqtt_client = AWSIoTMQTTClient(CLIENT_ID)
mqtt_client.configureEndpoint(ENDPOINT, 8883)
mqtt_client.configureCredentials(PATH_TO_ROOT, PATH_TO_KEY, PATH_TO_CERT)

print("🔌 Connessione a AWS IoT...")
mqtt_client.connect()
print("✅ Connesso")


# ==== Shared state dictionary ====
acts_name = ['actuator1', 'actuator2', 'actuator3']
locations = ["Cucina", "Bagno", "Salotto"]
actuators = {
    key: {
        "status": False,
        "location": loc
    }
    for key, loc in zip(acts_name, locations)

}
print("attuatori:", actuators)


# ==== Callback: handle delta messages ====
def delta_callback(actuator_name):
    def callback(client, userdata, message):
        try:
            payload = json.loads(message.payload)
            desired_status = payload["state"]["status"]
            
            print(f"📩 [DELTA] {actuator_name} → {desired_status}")
            actuators[actuator_name]["status"] = desired_status  # update internal state
            loc = actuators[actuator_name]["location"]

            # Publish new reported state
            update_payload = {
                "state": {
                    "reported": {
                        "status": desired_status,
                        "location": loc
                    }
                }
            }
            print("ok1")
            time.sleep(1)
            publish(actuator_name, desired_status)
            print("ok2")
            print(f"✅ [{actuator_name}] Stato aggiornato → {update_payload}")

        except Exception as e:
            print(f"❌ Errore nel delta callback per {actuator_name}: {e}")
    return callback

def publish(actuator_name, state):
    loc = actuators[actuator_name]["location"]
    payload = {
            "state": {
                "reported": {
                    "status": state,
                    "location": loc
                }
                
                
            }
        }
    topic = f"$aws/things/{actuator_name}/shadow/update"
    mqtt_client.publish(topic, json.dumps(payload), 0)
    print(f"📤 [{actuator_name}] Stato → {payload}")

# ==== Set up each actuator ====
for act in acts_name:
    # Subscribe to delta topic
    delta_topic = f"$aws/things/{act}/shadow/update/delta"
    time.sleep(1)
    mqtt_client.subscribe(delta_topic, 1, delta_callback(act))
    print(f"📡 Iscritto a {delta_topic}")
    

print("\n🕓 In attesa di messaggi e pubblicazione periodica... (Ctrl+C per uscire)")

# ==== Keep alive ====
try:
    while True:
        for name, attrs in actuators.items():
            state = attrs['status']
            publish(name, state)
        time.sleep(PUBLISH_DELAY)    
        
        
except KeyboardInterrupt:
    print("\n🛑 Interruzione manuale. Disconnessione...")
    mqtt_client.disconnect()
    print("🔌 Disconnesso")

