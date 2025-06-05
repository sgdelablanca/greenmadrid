const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'greenmadrid',
  password: 'postgres',
  port: 5433
});

async function main() {
  await client.connect();
  console.log('Conectado a PostgreSQL');

  const filePath = path.join(__dirname, '../data/areas_actividades_mayores202503.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const area of data) {
    const lat = parseFloat(area.LATITUD);
    const lon = parseFloat(area.LONGITUD);
    const geom = lat && lon ? `SRID=4326;POINT(${lon} ${lat})` : null;

    const fecha = area.FECHA_INSTALACION && area.FECHA_INSTALACION.trim() !== ''
      ? new Date(area.FECHA_INSTALACION)
      : null;

    const values = [
      area.ID,
      area.DESC_CLASIFICACION,
      area.COD_BARRIO,
      area.BARRIO,
      area.COD_DISTRITO,
      area.DISTRITO,
      area.ESTADO,
      parseFloat(area.COORD_GIS_X),
      parseFloat(area.COORD_GIS_Y),
      area.SISTEMA_COORD,
      lat,
      lon,
      area.DIRECCION_AUX,
      area.NDP,
      fecha,
      area.CODIGO_INTERNO,
      area.CONTRATO_COD,
      area.TIPO,
      parseInt(area.TOTAL_ELEM) || 0,
      geom
    ];

    try {
      await client.query(`
        INSERT INTO areas_mayores (
          id, desc_clasificacion, cod_barrio, barrio, cod_distrito, distrito, estado,
          coord_gis_x, coord_gis_y, sistema_coord, latitud, longitud, direccion_aux,
          ndp, fecha_instalacion, codigo_interno, contrato_cod, tipo, total_elem, geom
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, ST_GeomFromText($20, 4326)
        ) ON CONFLICT (id) DO NOTHING;
      `, values);
    } catch (err) {
      console.error(`Error insertando fila ID=${area.ID}:`, err.message);
    }
  }

  await client.end();
  console.log('Importación completada.');
}

main().catch(err => {
  console.error('Fallo general:', err);
  client.end();
});
