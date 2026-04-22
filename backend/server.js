const express = require('express');
const mqtt = require('mqtt');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const cors = require('cors')
app.use(cors())
app.use(express.json());

// Database Connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// MQTT Connection 
const mqttClient = mqtt.connect(`mqtts://${process.env.MQTT_HOST}`, {
  port: process.env.MQTT_PORT,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

mqttClient.on('connect', () => {
  console.log(' Connected to MQTT broker');
  mqttClient.subscribe('sensors/room1/air', (err) => {
    if (!err) console.log('Subscribed to sensors/room1/air');
  });
});

mqttClient.on('error', (err) => {
  console.error('MQTT error:', err.message);
});

//Save incoming MQTT messages to database
mqttClient.on('message', async (topic, message) => {
  try {
    const raw = message.toString().trim();
    if (!raw || !raw.startsWith('{')) return;

    const data = JSON.parse(raw);
    console.log('Received:', data);

    const temperature  = parseFloat(data.temperature);
    const humidity     = parseFloat(data.humidity);
    const gas_ppm      = parseFloat(data.gas_ppm);
    const aqi_estimate = parseInt(data.aqi_estimate);

    if (isNaN(temperature) || isNaN(humidity) || isNaN(gas_ppm) || isNaN(aqi_estimate)) {
      console.warn('⚠️ Invalid data — skipping');
      return;
    }

    await pool.query(
      `INSERT INTO readings (temperature, humidity, gas_ppm, aqi_estimate)
       VALUES ($1, $2, $3, $4)`,
      [temperature, humidity, gas_ppm, aqi_estimate]
    );
    console.log('Saved to database');
  } catch (err) {
    console.warn('Could not process message:', err.message);
  }
});

// API Endpoints

// GET latest reading
app.get('/api/latest', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM readings ORDER BY recorded_at DESC LIMIT 1'
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch latest reading' });
  }
});

// GET historical readings
app.get('/api/history', async (req, res) => {
  try {
    const { from, to } = req.query;
    const result = await pool.query(
      `SELECT * FROM readings 
       WHERE recorded_at BETWEEN $1 AND $2 
       ORDER BY recorded_at ASC`,
      [from || '2000-01-01', to || new Date()]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

//Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});