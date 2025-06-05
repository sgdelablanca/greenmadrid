const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'greenmadrid',
  password: 'postgres',
  port: 5433,
});

async function main() {
  const filePath = path.join(__dirname, '../data/areas_actividades_deportivas202505.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  for (const row of data) {
    const lat = parseFloat(row.LATITUD);
    const lon = parseFloat(row.LONGITUD);
    const geom = lat && lon ? `SRID=4326;POINT(${lon} ${lat})` : null;

    const values = [
      row.ID,
      row.DESC_CLASIFICACION,
      row.COD_BARRIO,
      row.BARRIO,
      row.COD_DISTRITO,
      row.DISTRITO,
      row.ESTADO,
      parseFloat(row.COORD_GIS_X),
      parseFloat(row.COORD_GIS_Y),
      row.SISTEMA_COORD,
      lat,
      lon,
      row.TIPO_VIA,
      row.NOM_VIA,
      row.NUM_VIA,
      row.COD_POSTAL,
      row.DIRECCION_AUX,
      row.NDP,
      row.FECHA_INSTALACION || null,
      row.CODIGO_INTERNO,
      row.CONTRATO_COD,
      parseInt(row.TOTAL_ELEM) || 0,
      geom
    ];

    try {
      await pool.query(
        `INSERT INTO areas_actividades_deportivas (
          id, desc_clasificacion, cod_barrio, barrio, cod_distrito, distrito,
          estado, coord_gis_x, coord_gis_y, sistema_coord, latitud, longitud,
          tipo_via, nom_via, num_via, cod_postal, direccion_aux, ndp,
          fecha_instalacion, codigo_interno, contrato_cod, total_elem, geom
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17, $18,
          $19, $20, $21, $22, ST_GeomFromText($23, 4326)
        ) ON CONFLICT (id) DO NOTHING;`,
        values
      );
    } catch (error) {
      console.error(`Error en fila ID=${row.ID}:`, error.message);
    }
  }

  await pool.end();
  console.log("Importación completada.");
}

main();