
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'greenmadrid',
  password: 'postgres',
  port: 5433,
});


router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fuentes_agua LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener fuentes:', err);
    res.status(500).json({ error: 'Error al obtener datos de fuentes' });
  }
});

module.exports = router;
