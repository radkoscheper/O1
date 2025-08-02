const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Basic API endpoints
app.get('/api/test', async (req, res) => {
  res.json({ message: 'API is working!' });
});

app.get('/api/destinations/homepage', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM destinations WHERE "showOnHomepage" = true AND "isDeleted" = false LIMIT 6');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;