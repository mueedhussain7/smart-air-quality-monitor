#include "DHTesp.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

// ── Sensor pins ──────────────────────────────────────────────
DHTesp dht;
#define DHT_PIN    13
#define MQ135_PIN  36

// ── WiFi credentials ─────────────────────────────────────────
const char* WIFI_SSID     = "Telenor2950bag";
const char* WIFI_PASSWORD = "Pakistan786";

// ── MQTT broker ───────────────────────────────────────────────
const char* MQTT_HOST     = "07a080e680674b16a789322ea88fb3ef.s1.eu.hivemq.cloud";
const int   MQTT_PORT     = 8883;
const char* MQTT_USERNAME = "esp32client";
const char* MQTT_PASSWORD = "NWpfT6m5aW2D8GZ";
const char* MQTT_TOPIC    = "sensors/room1/air";

// ── WiFi + MQTT clients ───────────────────────────────────────
WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);

// ── Connect to WiFi ───────────────────────────────────────────
void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

// ── Connect to MQTT ───────────────────────────────────────────
void connectMQTT() {
  espClient.setInsecure();
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  while (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT...");
    if (mqttClient.connect("ESP32Client", MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("Connected to MQTT broker!");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" retrying in 5 seconds...");
      delay(5000);
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
  // Reconnect if disconnected
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  // Read sensors
  float temperature = dht.getTemperature();
  float humidity    = dht.getHumidity();
  int   gasValue    = analogRead(MQ135_PIN);

  // Estimate AQI (simple formula)
  int aqi = map(gasValue, 0, 4095, 0, 500);

  // Print to Serial Monitor
  Serial.println("-------------------");
  Serial.print("Temperature: "); Serial.println(temperature);
  Serial.print("Humidity: ");    Serial.println(humidity);
  Serial.print("Gas Value: ");   Serial.println(gasValue);
  Serial.print("AQI: ");         Serial.println(aqi);

  // Skip if DHT22 failed
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("DHT22 read failed - skipping");
    delay(10000);
    return;
  }

  // Build JSON message
  String payload = "{";
  payload += "\"temperature\":" + String(temperature, 2) + ",";
  payload += "\"humidity\":"    + String(humidity, 2)    + ",";
  payload += "\"gas_ppm\":"     + String(gasValue)       + ",";
  payload += "\"aqi_estimate\":" + String(aqi);
  payload += "}";

  // Publish to MQTT
  if (mqttClient.publish(MQTT_TOPIC, payload.c_str())) {
    Serial.println("Published: " + payload);
  } else {
    Serial.println("Publish failed!");
  }

  delay(10000);
}