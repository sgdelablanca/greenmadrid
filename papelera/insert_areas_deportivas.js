// backend/scripts/insert_areas_deportivas.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'greenmadrid',
  password: 'postgres',
  port: 5433,
});

async function main() {
  await client.connect();
  console.log('Conectado a PostgreSQL');

  const filePath = path.join(__dirname, '../data/areas_actividades_deportivas202503.csv');
  const stream = fs.createReadStream(filePath).pipe(csv({ separator: ';' }));

  for await (const row of stream) {
    const lat = parseFloat(row.LATITUD?.replace(',', '.'));
    const lon = parseFloat(row.LONGITUD?.replace(',', '.'));
    const geom = lat && lon ? `SRID=4326;POINT(${lon} ${lat})` : null;

    const coordXParsed = row['COORD_GIS_X']?.trim() !== '' ? parseFloat(row['COORD_GIS_X'].replace(',', '.')) : null;
    const coordYParsed = row['COORD_GIS_Y']?.trim() !== '' ? parseFloat(row['COORD_GIS_Y'].replace(',', '.')) : null;

    const fechaInstalacion = row['FECHA_INSTALACION']?.trim() !== '' ? row['FECHA_INSTALACION'] : null;
    const totalElemParsed = row['TOTAL_ELEM']?.trim() !== '' ? parseInt(row['TOTAL_ELEM']) : 0;

    const values = [
      row['ID'],
      row['DESC_CLASIFICACION'],
      row['COD_BARRIO'],
      row['BARRIO'],
      row['COD_DISTRITO'],
      row['DISTRITO'],
      row['ESTADO'],
      coordXParsed,
      coordYParsed,
      row['SISTEMA_COORD'],
      lat,
      lon,
      row['TIPO_VIA'],
      row['NOM_VIA'],
      row['NUM_VIA'],
      row['COD_POSTAL'],
      row['DIRECCION_AUX'],
      row['NDP'],
      fechaInstalacion,
      row['CODIGO_INTERNO'],
      row['CONTRATO_COD'],
      totalElemParsed,
      geom
    ];

    try {
      await client.query(
        `INSERT INTO areas_deportivas (
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
    } catch (err) {
      console.error(`Error insertando fila ID=${row.ID}:`, err.message);
    }
  }

  await client.end();
  console.log('Importación completada.');
}

main().catch(err => {
  console.error('Fallo general:', err);
  client.end();
});
