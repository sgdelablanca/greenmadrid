const axios = require('axios');
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

  let page = 1;
  const pageSize = 100;
  let hasNext = true;

  while (hasNext) {
    const url = `https://ciudadesabiertas.madrid.es/dynamicAPI/API/query/mint_fuentes.json?pageSize=${pageSize}&page=${page}`;
    const { data } = await axios.get(url);
    const records = data.records;

    if (records.length === 0) {
      hasNext = false;
      break;
    }

    for (const fuente of records) {
      const geom = fuente.LATITUD && fuente.LONGITUD
        ? `SRID=4326;POINT(${fuente.LONGITUD} ${fuente.LATITUD})`
        : null;

      await client.query(
        `INSERT INTO fuentes_agua (
          id, desc_clasificacion, cod_barrio, barrio, cod_distrito, distrito, estado,
          coord_gis_x, coord_gis_y, sistema_coord, latitud, longitud,
          tipo_via, nom_via, num_via, cod_postal, direccion_aux, ndp,
          fecha_instalacion, codigo_interno, contrato_cod, ubicacion, uso, modelo, geom
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17, $18,
          $19, $20, $21, $22, $23, $24,
          ST_GeomFromText($25, 4326)
        ) ON CONFLICT (id) DO NOTHING`,
        [
          fuente.ID, fuente.DESC_CLASIFICACION, fuente.COD_BARRIO, fuente.BARRIO, fuente.COD_DISTRITO,
          fuente.DISTRITO, fuente.ESTADO, fuente.COORD_GIS_X, fuente.COORD_GIS_Y, fuente.SISTEMA_COORD,
          fuente.LATITUD, fuente.LONGITUD, fuente.TIPO_VIA, fuente.NOM_VIA, fuente.NUM_VIA,
          fuente.COD_POSTAL, fuente.DIRECCION_AUX, fuente.NDP, fuente.FECHA_INSTALACION,
          fuente.CODIGO_INTERNO, fuente.CONTRATO_COD, fuente.UBICACION, fuente.USO, fuente.MODELO,
          geom
        ]
      );
    }

    page++;
    console.log(`Página ${page - 1} procesada...`);
    hasNext = data.next !== undefined;
  }

  console.log('Proceso completado.');
  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  client.end();
});
