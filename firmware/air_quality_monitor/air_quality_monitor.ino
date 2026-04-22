#include "DHTesp.h"

DHTesp dht;

#define MQ135_PIN 36

void setup() {
  Serial.begin(115200);
  delay(2000);
  dht.setup(13, DHTesp::DHT22);
  Serial.println("Testing sensors...");
}

void loop() {
  delay(3000);
  
  // DHT22 readings
  float humidity = dht.getHumidity();
  float temperature = dht.getTemperature();
  
  // MQ135 reading
  int gasValue = analogRead(MQ135_PIN);
  
  Serial.println("-------------------");
  Serial.print("Temperature: ");
  Serial.println(temperature);
  Serial.print("Humidity: ");
  Serial.println(humidity);
  Serial.print("Gas Value: ");
  Serial.println(gasValue);
}