import time
import os
import random
import json
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
from dotenv import load_dotenv
import questionary

# ==== Configurazione ====
load_dotenv(dotenv_path="../gateway/.env")

ENDPOINT = os.getenv("AWS_ENDPOINT")
CLIENT_ID = "SensorSimulator"

PATH_TO_CERT = "../gateway/certificates/device-certificate.pem.crt"
PATH_TO_KEY = "../gateway/certificates/device-private.pem.key"
PATH_TO_ROOT = "../gateway/certificates/root_CA1.pem"

PUBLISH_DELAY = 1.2  # in secondi

# ==== Mappa sensori → stanze ====
sensors = {
    "sensor1": "Bagno",
    "sensor2": "Cucina",
    "sensor3": "Salotto",
    "sensor4": "Camera",
    "sensor5": "Stanzino",
    "sensor6": "Seminterrato"
}

# ==== Selezione interattiva dei sensori ====
selected_sensors = questionary.checkbox(
    "🔘 Seleziona i sensori su cui vuoi pubblicare:",
    choices=list(sensors.keys())
).ask()

if not selected_sensors:
    print("❌ Nessun sensore selezionato. Uscita.")
    exit()

# ==== Chiedi quanti messaggi inviare ====
num_messages = questionary.text(
    "📨 Quanti messaggi vuoi inviare PER OGNI sensore?",
    validate=lambda val: val.isdigit() and int(val) > 0 or "Inserisci un numero positivo"
).ask()
NUM_MESSAGES = int(num_messages)

# ==== Connessione al broker MQTT ====
mqtt_client = AWSIoTMQTTClient(CLIENT_ID)
mqtt_client.configureEndpoint(ENDPOINT, 8883)
mqtt_client.configureCredentials(PATH_TO_ROOT, PATH_TO_KEY, PATH_TO_CERT)

print("🔌 Connessione a AWS IoT...")
mqtt_client.connect()
print("✅ Connesso")

# ==== Pubblicazione dei messaggi ====
print(f"\n📡 Inizio pubblicazione ({NUM_MESSAGES} messaggi per ciascun sensore)\n")

for i in range(NUM_MESSAGES):
    for sensor in selected_sensors:
        topic = f"$aws/things/{sensor}/shadow/update"
        payload = {
            "state": {
                "reported": {
                    "temperature": random.randint(-20, 40),
                    "humidity": random.randint(0, 100),
                    "location": sensors.get(sensor, "Sconosciuto")
                }
            }
        }
        mqtt_client.publish(topic, json.dumps(payload), 1)
        print(f"✅ [{sensor}] → {payload}")
        time.sleep(PUBLISH_DELAY / len(selected_sensors))

print("\n📴 Fine pubblicazione")

# ==== Disconnessione ====
mqtt_client.disconnect()
print("🔌 Disconnesso")
