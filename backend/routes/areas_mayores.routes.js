const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'greenmadrid',
  password: 'postgres',
  port: 5433
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM areas_mayores LIMIT 1000');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener áreas mayores:', error);
    res.status(500).json({ error: 'Error al obtener datos de áreas mayores' });
  }
});

module.exports = router;
