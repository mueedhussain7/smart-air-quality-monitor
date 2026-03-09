const mqtt = require('mqtt');
require('dotenv').config();

const client = mqtt.connect(`mqtts://${process.env.MQTT_HOST}`, {
  port: process.env.MQTT_PORT,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

client.on('connect', () => {
  console.log('Simulator connected to MQTT broker');

  // Send a fake reading every 5 seconds
  setInterval(() => {
    const fakeData = {
      temperature: (20 + Math.random() * 5).toFixed(2),   // 20–25°C
      humidity:    (40 + Math.random() * 20).toFixed(2),  // 40–60%
      gas_ppm:     (300 + Math.random() * 200).toFixed(2),// 300–500 ppm
      aqi_estimate: Math.floor(50 + Math.random() * 50),  // 50–100
    };

    client.publish('sensors/room1/air', JSON.stringify(fakeData));
    console.log('📤 Sent:', fakeData);
  }, 5000);
});

client.on('error', (err) => {
  console.error('Error:', err.message);
});