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
    const result = await pool.query(
      `SELECT * FROM eventos_culturales
       WHERE latitud IS NOT NULL AND longitud IS NOT NULL
       AND fecha_fin >= NOW()`
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener eventos:', err);
    res.status(500).send('Error al obtener eventos culturales');
  }
});

module.exports = router;
