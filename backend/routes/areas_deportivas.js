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
      `SELECT id, desc_clasificacion, barrio, distrito, tipo_via, nom_via, num_via, latitud, longitud
       FROM areas_actividades_deportivas
       WHERE latitud IS NOT NULL AND longitud IS NOT NULL
       LIMIT 500`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener áreas deportivas:', err);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

module.exports = router;
