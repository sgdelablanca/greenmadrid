
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
  const { search = '', barrio = '', order = 'asc' } = req.query;

  const mapaAccesibilidad = {
    '0': 'No accesible',
    '1': 'Accesible',
    '2': 'Parcialmente accesible',
    '3': 'Sin información',
    '4': 'Lengua de signos',
    '5': 'Señalización podotáctil',
    '6': 'Bucle magnético'
  };

  try {
    const values = [];
    let where = '';

    if (search) {
      values.push(`%${search}%`);
      where += `LOWER(nombre) ILIKE LOWER($${values.length})`;
    }

    if (barrio) {
      values.push(barrio);
      where += where ? ` AND barrio = $${values.length}` : `barrio = $${values.length}`;
    }

    const query = `
      SELECT * FROM parques_jardines
      ${where ? 'WHERE ' + where : ''}
      ORDER BY nombre ${order.toLowerCase() === 'desc' ? 'DESC' : 'ASC'}
    `;

    const result = await pool.query(query, values);

    const parques = result.rows.map(p => ({
      ...p,
      accesibilidad: p.accesibilidad in mapaAccesibilidad
        ? [mapaAccesibilidad[p.accesibilidad]]
        : []
    }));

    res.json(parques);
  } catch (err) {
    console.error('Error al obtener parques:', err);
    res.status(500).json({ error: 'Error al obtener datos de parques' });
  }
});





//  Obtener lista de barrios únicos
router.get('/barrios/lista', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT barrio FROM parques_jardines ORDER BY barrio ASC');
    const barrios = result.rows.map(row => row.barrio).filter(Boolean);
    res.json(barrios);
  } catch (err) {
    console.error('Error al obtener barrios:', err);
    res.status(500).json({ error: 'Error al obtener barrios' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const mapaAccesibilidad = {
    '0': 'No accesible',
    '1': 'Accesible',
    '2': 'Parcialmente accesible',
    '3': 'Sin información',
    '4': 'Lengua de signos',
    '5': 'Señalización podotáctil',
    '6': 'Bucle magnético'
  };

  try {
    const result = await pool.query('SELECT * FROM parques_jardines WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parque no encontrado' });
    }

    const parque = result.rows[0];
    const accesibilidadTexto = parque.accesibilidad in mapaAccesibilidad
      ? [mapaAccesibilidad[parque.accesibilidad]]
      : [];

    res.json({ ...parque, accesibilidad: accesibilidadTexto });
  } catch (err) {
    console.error('Error al obtener parque por ID:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});








module.exports = router;
