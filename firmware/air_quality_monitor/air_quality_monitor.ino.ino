#include "DHTesp.h"

DHTesp dht;

void setup() {
  Serial.begin(115200);
  delay(2000);
  dht.setup(13, DHTesp::DHT22);
  Serial.println("Testing DHT22...");
}

void loop() {
  delay(3000);
  float humidity = dht.getHumidity();
  float temperature = dht.getTemperature();
  Serial.print("Status: ");
  Serial.println(dht.getStatusString());
  Serial.print("Temperature: ");
  Serial.println(temperature);
  Serial.print("Humidity: ");
  Serial.println(humidity);
}