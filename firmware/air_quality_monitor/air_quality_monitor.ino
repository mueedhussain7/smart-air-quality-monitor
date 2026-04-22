#include "DHTesp.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include "config.h"

// ── Sensor pins ──────────────────────────────────────────────
DHTesp dht;
#define DHT_PIN    13
#define MQ135_PIN  36

// ── MQTT port ─────────────────────────────────────────────────
const int MQTT_PORT = 8883;

// ── MQTT topic ────────────────────────────────────────────────
const char* MQTT_TOPIC = "sensors/room1/air";

// ── WiFi + MQTT clients ───────────────────────────────────────
WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);

// ── Connect to WiFi ───────────────────────────────────────────
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("WiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("");
    Serial.println("WiFi failed — will retry next loop");
  }
}

// ── Connect to MQTT ───────────────────────────────────────────
void connectMQTT() {
  if (mqttClient.connected()) return;
  espClient.setInsecure();
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  int attempts = 0;
  while (!mqttClient.connected() && attempts < 5) {
    Serial.print("Connecting to MQTT...");
    if (mqttClient.connect("ESP32Client", MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("Connected to MQTT broker!");
    } else {
      Serial.print("Failed rc=");
      Serial.print(mqttClient.state());
      Serial.println(" retrying in 3 seconds...");
      delay(3000);
      attempts++;
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(2000);

  // Start DHT22
  dht.setup(DHT_PIN, DHTesp::DHT22);
  Serial.println("DHT22 ready");

  // Connect WiFi and MQTT
  connectWiFi();
  connectMQTT();

  Serial.println("System ready! Sending data every 10 seconds...");
}

void loop() {
  // ── Auto reconnect ────────────────────────────────────────
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost — reconnecting...");
    connectWiFi();
  }

  if (!mqttClient.connected()) {
    Serial.println("MQTT lost — reconnecting...");
    connectMQTT();
  }

  mqttClient.loop();

  // ── Read sensors ──────────────────────────────────────────
  float temperature = dht.getTemperature();
  float humidity    = dht.getHumidity();
  int   gasValue    = analogRead(MQ135_PIN);
  int   aqi         = map(gasValue, 0, 4095, 0, 500);

  // ── Print to Serial Monitor ───────────────────────────────
  Serial.println("-------------------");
  Serial.print("Temperature: "); Serial.println(temperature);
  Serial.print("Humidity: ");    Serial.println(humidity);
  Serial.print("Gas Value: ");   Serial.println(gasValue);
  Serial.print("AQI: ");         Serial.println(aqi);

  // ── Skip if DHT22 failed ──────────────────────────────────
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("DHT22 read failed — skipping");
    delay(10000);
    return;
  }

  // ── Build JSON ────────────────────────────────────────────
  String payload = "{";
  payload += "\"temperature\":" + String(temperature, 2) + ",";
  payload += "\"humidity\":"    + String(humidity, 2)    + ",";
  payload += "\"gas_ppm\":"     + String(gasValue)       + ",";
  payload += "\"aqi_estimate\":" + String(aqi);
  payload += "}";

  // ── Publish to MQTT ───────────────────────────────────────
  if (WiFi.status() == WL_CONNECTED && mqttClient.connected()) {
    if (mqttClient.publish(MQTT_TOPIC, payload.c_str())) {
      Serial.println("📤 Published: " + payload);
    } else {
      Serial.println("Publish failed!");
    }
  } else {
    Serial.println("Skipping publish — not connected");
  }

  delay(10000);
}