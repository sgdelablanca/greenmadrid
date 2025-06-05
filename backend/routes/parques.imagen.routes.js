
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const axios = require('axios');
const cheerio = require('cheerio');

// Configuro conexion a postgres
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'greenmadrid',
  password: 'postgres',
  port: 5433,
});

// imagen destacada de un parque
router.get('/:id/imagen', async (req, res) => {
  const { id } = req.params;
  //const imagePath = path.join(__dirname, '../frontend/assets/img', `${id}.jpg`);
  const imagePath = path.join(__dirname, '../public/assets/img', `${id}.jpg`);


  // 1. Si existe la imagen local, se agrega directamente
  if (fs.existsSync(imagePath)) {
    return res.sendFile(imagePath);
  }

  // 2. Si no existe, hago scraping de la URL oficial
  try {
    const result = await pool.query(
      'SELECT url_ficha FROM parques_jardines WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0 || !result.rows[0].url_ficha) {
      return res.status(404).json({ error: 'URL oficial no disponible para este parque' });
    }

    const fichaUrl = result.rows[0].url_ficha;
    const response = await axios.get(fichaUrl);
    const $ = cheerio.load(response.data);
    const ogImage = $('meta[property="og:image"]').attr('content');

    if (ogImage) {
      return res.redirect(ogImage);  
    } else {
      return res.status(404).json({ error: 'No se encontró imagen en la ficha oficial' });
    }
  } catch (err) {
    console.error('Error al obtener imagen destacada:', err);
    res.status(500).json({ error: 'Error al obtener la imagen destacada' });
  }
});

module.exports = router;
