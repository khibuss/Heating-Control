import json
import os
import random
import time

import questionary
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
from dotenv import load_dotenv

# ==== Configurazione ====
load_dotenv(dotenv_path="../gateway/.env")

ENDPOINT = os.getenv("AWS_ENDPOINT")
CLIENT_ID = "SensorSimulator"

PATH_TO_CERT = "../gateway/certificates/device-certificate.pem.crt"
PATH_TO_KEY = "../gateway/certificates/device-private.pem.key"
PATH_TO_ROOT = "../gateway/certificates/root_CA1.pem"

PUBLISH_DELAY = 1.2  # in secondi

# ==== Selezione interattiva dei sensori ====
selected_sensors = questionary.checkbox(
    "🔘 Seleziona i sensori su cui vuoi pubblicare:",
    choices=[f"sensor{i}" for i in range(1, 7)]
).ask()

if not selected_sensors:
    print("❌ Nessun sensore selezionato. Uscita.")
    exit()

# ==== Connessione al broker MQTT ====
mqtt_client = AWSIoTMQTTClient(CLIENT_ID)
mqtt_client.configureEndpoint(ENDPOINT, 8883)
mqtt_client.configureCredentials(PATH_TO_ROOT, PATH_TO_KEY, PATH_TO_CERT)

print("🔌 Connessione a AWS IoT...")
mqtt_client.connect()
print("✅ Connesso")

# ==== Pubblicazione dei messaggi ====
print(f"\n📡 Inizio pubblicazione messaggi\n")

try:
    while True:
        for sensor in selected_sensors:
            topic = f"$aws/things/{sensor}/shadow/update"
            payload = {
                "state": {
                    "reported": {
                        "temperature": random.randint(30, 40),
                        "humidity": random.randint(0, 100)
                    }
                }
            }
            mqtt_client.publish(topic, json.dumps(payload), 1)
            print(f"✅ [{sensor}] → {payload}")
            time.sleep(PUBLISH_DELAY / len(selected_sensors))
        time.sleep(10)
except KeyboardInterrupt:
    print("\n⛔ Interruzione da tastiera. Uscita...")

# ==== Disconnessione ====
mqtt_client.disconnect()
print("🔌 Disconnesso")
