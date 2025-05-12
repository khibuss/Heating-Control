# 🔧 Sensor Simulator for AWS IoT

Questo script Python simula l'invio di dati da sensori a AWS IoT Core via MQTT, usando il Device Shadow.

## ✨ Funzionalità
- Selezione interattiva dei sensori (`sensor1`–`sensor6`)
- Scelta del numero di messaggi da inviare
- Pubblicazione di valori casuali di temperatura, umidità e stato

## 📦 Requisiti

- Python 3.7+
- Certificati AWS IoT in `../gateway/certificates/`
- File `.env` in `../gateway/` con la variabile `AWS_ENDPOINT`

## 🛠️ Librerie necessarie

```bash
pip install python-dotenv questionary AWSIoTPythonSDK
