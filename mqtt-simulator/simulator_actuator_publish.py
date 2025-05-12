import os
import time
import json
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
from dotenv import load_dotenv
import questionary

# ==== Configurazione ====
load_dotenv(dotenv_path="../gateway/.env")

ENDPOINT = os.getenv("AWS_ENDPOINT")
CLIENT_ID = "ActuatorSimulator"
PATH_TO_CERT = "../gateway/certificates/device-certificate.pem.crt"
PATH_TO_KEY = "../gateway/certificates/device-private.pem.key"
PATH_TO_ROOT = "../gateway/certificates/root_CA1.pem"
PUBLISH_DELAY = 5  # secondi

# ==== Mappa delle location ====
location_map = {
    "actuator1": "Salotto",
    "actuator2": "Cucina",
    "actuator3": "Bagno",
    "actuator4": "Camera da letto"
}

# ==== Selezione interattiva degli attuatori ====
selected_actuators = questionary.checkbox(
    "🛠️ Seleziona gli attuatori da simulare:",
    choices=list(location_map.keys())
).ask()

if not selected_actuators:
    print("❌ Nessun attuatore selezionato. Uscita.")
    exit()

# ==== Stato iniziale attuatori ====
actuators = {
    name: {
        "status": False,
        "location": location_map.get(name, "Sconosciuto")
    }
    for name in selected_actuators
}

# ==== Connessione al broker MQTT ====
mqtt_client = AWSIoTMQTTClient(CLIENT_ID)
mqtt_client.configureEndpoint(ENDPOINT, 8883)
mqtt_client.configureCredentials(PATH_TO_ROOT, PATH_TO_KEY, PATH_TO_CERT)

print("🔌 Connessione a AWS IoT...")
mqtt_client.connect()
print("✅ Connesso")

# ==== Callback: gestione delta ====
def delta_callback(actuator_name):
    def callback(client, userdata, message):
        try:
            payload = json.loads(message.payload)
            desired_status = payload["state"]["status"]
            print(f"📩 [DELTA] {actuator_name} → {desired_status}")

            actuators[actuator_name]["status"] = desired_status
            publish(actuator_name, desired_status)
            print(f"✅ [{actuator_name}] Stato aggiornato")

        except Exception as e:
            print(f"❌ Errore nel delta callback per {actuator_name}: {e}")
    return callback

# ==== Funzione di pubblicazione ====
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

# ==== Iscrizione ai topic delta ====
for name in selected_actuators:
    delta_topic = f"$aws/things/{name}/shadow/update/delta"
    mqtt_client.subscribe(delta_topic, 1, delta_callback(name))
    print(f"📡 Iscritto a {delta_topic}")

print("\n🕓 In attesa e pubblicazione periodica... (Ctrl+C per uscire)")

# ==== Loop principale ====
try:
    while True:
        for name, attrs in actuators.items():
            publish(name, attrs['status'])
        time.sleep(PUBLISH_DELAY)
except KeyboardInterrupt:
    print("\n🛑 Interruzione manuale. Disconnessione...")
    mqtt_client.disconnect()
    print("🔌 Disconnesso")
