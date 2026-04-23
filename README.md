# 🌬 AirWatch — Smart Indoor Air Quality Monitor
> IoT Project

A complete end-to-end IoT pipeline that monitors indoor air quality in real time. Physical sensors (ESP32 + DHT22 + MQ-135) collect temperature, humidity and gas data, publish it over MQTT with TLS encryption to a Node.js backend, store it in PostgreSQL, and display it on a 5-page React dashboard with live updates, alerts and historical charts.

---

## Architecture
ESP32 D1 R32 (DHT22 + MQ-135 sensors)
│
│  MQTT over TLS — port 8883
▼
HiveMQ Cloud Broker
│
▼
Node.js + Express Backend (port 3000)
│
▼
PostgreSQL Database (air_quality)
│
▼
React + TypeScript Dashboard (port 5173)

---

## Hardware Required

| Component | Purpose | Notes |
|---|---|---|
| ESP32 D1 R32 | Microcontroller | CH340 USB driver required on Mac |
| DHT22 (AM2302) | Temperature & Humidity | Wired to IO13 |
| MQ-135 | Gas / Air Quality sensor | Wired to IO36, needs 5V |
| Breadboard 840pt | Circuit assembly | No soldering needed |
| Jumper wires | Connections | Male-to-male and male-to-female |

---

## Wiring

**DHT22:**

| DHT22 Pin | ESP32 Pin | Wire Colour |
|---|---|---|
| Pin 1 — VCC | 3V3 | Red |
| Pin 2 — DATA | IO13 | Yellow |
| Pin 3 — NC | — | Not connected |
| Pin 4 — GND | GND | Black |

**MQ-135:**

| MQ-135 Pin | ESP32 Pin | Wire Colour |
|---|---|---|
| VCC | 5V | Green |
| AO (signal) | IO39 | Blue |
| GND | GND | Black |

---

## Project Structure
smart-air-quality-monitor/
├── firmware/                    # ESP32 Arduino firmware
│   └── air_quality_monitor/
│       ├── air_quality_monitor.ino
│       └── config.h.example     # Copy to config.h and fill credentials
├── backend/                     # Node.js + Express server
│   ├── server.js                # Main server — MQTT + API + DB
│   ├── simulate.js              # Fake sensor data for testing
│   └── .env                     # Secrets (not in Git)
├── frontend/                    # React + TypeScript dashboard
│   └── src/
│       ├── pages/               # Dashboard, Analytics, Alerts, System Status, Settings
│       └── components/          # Sidebar, StatusCard, SparkLine, AreaChart
└── docs/                        # Documentation

---

## Setup Guide

### Step 1 — Clone the Repository

```bash
git clone https://github.com/mueedhussain7/smart-air-quality-monitor.git
cd smart-air-quality-monitor
```

### Step 2 — MQTT Broker

1. Create a free account at [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker)
2. Create a cluster and note your host URL
3. Create credentials (username + password)
4. Enable TLS on port 8883

### Step 3 — Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=air_quality
DB_USER=your_postgres_username
DB_PASSWORD=
MQTT_HOST=your_hivemq_host.s1.eu.hivemq.cloud
MQTT_PORT=8883
MQTT_USERNAME=esp32client
MQTT_PASSWORD=your_mqtt_password
PORT=3000

Create the PostgreSQL database:

```bash
psql postgres
CREATE DATABASE air_quality;
\c air_quality
CREATE TABLE readings (
  id SERIAL PRIMARY KEY,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  gas_ppm DECIMAL(8,2),
  aqi_estimate INT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\q
```

Start the backend:

```bash
node server.js
```

### Step 4 — Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Step 5 — Firmware Setup

1. Install [Arduino IDE](https://www.arduino.cc/en/software)
2. Add ESP32 board support via Boards Manager (Espressif Systems)
3. Install libraries: **DHT sensor library for ESPx** and **PubSubClient**
4. Install CH340 USB driver for Mac from [wch-ic.com](https://www.wch-ic.com/downloads/CH341SER_MAC_ZIP.html)
5. Copy `firmware/air_quality_monitor/config.h.example` to `config.h`
6. Fill in your WiFi name, WiFi password, MQTT host and MQTT password in `config.h`
7. Open `firmware/air_quality_monitor/air_quality_monitor.ino` in Arduino IDE
8. Select board: **Tools → Board → ESP32 Dev Module**
9. Select port: **Tools → Port → /dev/cu.wchusbserial...**
10. Upload to ESP32

### Step 6 — Test Without Hardware (Simulator)

```bash
cd backend
node simulate.js
```

---

## Running the Full System

You need 3 terminals:

```bash
# Terminal 1 — Start PostgreSQL (if not running)
pg_ctl -D /usr/local/var/postgresql@18 start

# Terminal 2 — Backend
cd backend && node server.js

# Terminal 3 — Frontend
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Dashboard Pages

| Page | Description |
|---|---|
| Dashboard | Live sensor cards with gauges, sparklines, status bar, alert banner and trend chart |
| Analytics | Historical charts for all 4 metrics, average stats, recent readings table |
| Alerts | Warning log with severity levels (critical/warning/info) and acknowledge buttons |
| System Status | Device health cards, API response time, total readings, connection status |
| Settings | Dark/light mode toggle, gas alert threshold slider, refresh interval |

---

## Security

| Measure | Implementation |
|---|---|
| MQTT Encryption | TLS 1.3 on port 8883 — plain-text port 1883 actively rejected |
| MQTT Authentication | Username and password required for all broker connections |
| Firmware Credentials | Stored in config.h — excluded from Git via .gitignore |
| Backend Credentials | Stored in .env file — excluded from Git via .gitignore |
| Input Validation | Backend validates all JSON before saving to database |
| CORS | Backend configured with CORS for frontend connection |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/latest` | Returns the most recent sensor reading |
| GET | `/api/history?from=...&to=...` | Returns readings within a date range |

---

## Test Results

| Test | Result | Target |
|---|---|---|
| 24-Hour Soak Test | 6586 readings saved, no crashes | No gaps > 1 minute ✅ |
| Latency | Under 10 seconds sensor to dashboard | Under 10 seconds ✅ |
| TLS Enforcement | Port 1883 actively rejected | Rejected ✅ |
| Credential Security | No secrets in any GitHub file | Zero exposure ✅ |
| DHT22 Accuracy | ±0.5°C temperature, ±2% humidity | ±2°C, ±5% ✅ |

---

## GitHub Repository

[github.com/mueedhussain7/smart-air-quality-monitor](https://github.com/mueedhussain7/smart-air-quality-monitor)

