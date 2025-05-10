# 🌡️ Heating Control System

Questo progetto è un sistema di controllo intelligente della temperatura basato su AWS IoT, progettato per monitorare e regolare automaticamente (o manualmente) l’attivazione delle pompe di calore in funzione dei dati raccolti da sensori ambientali.

---

## 📦 Architettura generale

Il sistema è progettato per il controllo del riscaldamento in ambienti distribuiti e si compone dei seguenti elementi:

- ✅ **Interfaccia Web (accesso riservato al sysadmin)**: consente la visualizzazione dei dati, la configurazione delle soglie e il controllo manuale degli attuatori.
- ✅ **Backend Node.js**: espone le API, gestisce l'autenticazione, la logica di controllo e comunica con i servizi AWS.
- ✅ **Sensori (Temperatura e Umidità)**: inviano periodicamente dati ambientali tramite shadow IoT.
- ✅ **Attuatori (Pompe di Calore)**: attivati/disattivati in base alla temperatura rilevata, o manualmente dal sysadmin.
- ✅ **AWS IoT Core**: gestisce la comunicazione MQTT sicura tra dispositivi e cloud.
- ✅ **Amazon DynamoDB**: database NoSQL per la memorizzazione di dati storici e stato corrente di sensori e attuatori.
- ✅ **AWS Lambda**: funzioni serverless che aggiornano automaticamente i dati su eventi IoT.
- ✅ **Notifiche Telegram**: invio automatico di notifiche all’amministratore in caso di modifiche o superamento soglie.

Tutti i componenti sono pensati per garantire **scalabilità**, **modularità** e **affidabilità** del sistema.

---
## 🧠 Funzionalità principali

-  **Raccolta dati in tempo reale** dai sensori (temperatura e umidità)
-  **Attivazione automatica** delle pompe in base a soglie configurabili
-  **Controllo manuale** degli attuatori singolarmente via web
-  **Accesso protetto** all'interfaccia (admin only)
-  **Notifiche Telegram** in tempo reale per ogni intervento o anomalia
-  **Gestione TTL** dei dati dei sensori (auto-cancellazione dopo 10 minuti)
-  **Modalità di intervento globale o per singolo sensore**
-  **Configurazione delle soglie** tramite frontend
-  **Aggiornamento shadow automatico** tramite AWS Lambda

## 🛠️ Requisiti

- Node.js
- Account AWS con privilegi da amministratore
- Sensori e attuatori compatibili con MQTT
- Certificati e policies correttamente configurati su AWS IoT Core
