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

  const url = 'https://datos.madrid.es/egob/catalogo/200761-0-parques-jardines.json';
  const { data } = await axios.get(url);
  const parques = data['@graph'];

  for (const parque of parques) {
    const direccion = parque.address?.['street-address'] || null;
    const barrio = parque.address?.area?.['@id']?.split('/').pop() || null;
    const distrito = parque.address?.district?.['@id']?.split('/').pop() || null;
    const localidad = parque.address?.locality || null;
    const codigoPostal = parque.address?.['postal-code'] || null;

    const lat = parque.location?.latitude || null;
    const lon = parque.location?.longitude || null;
    const geom = lat && lon ? `SRID=4326;POINT(${lon} ${lat})` : null;

    const values = [
      parque.id,
      parque.title,
      parque.relation || null,
      distrito,
      barrio,
      localidad,
      codigoPostal,
      direccion,
      lat,
      lon,
      parque.organization?.['organization-desc'] || null,
      parseInt(parque.organization?.accesibility) || null,
      parque.organization?.schedule || null,
      parque.organization?.services || null,
      parque.organization?.['organization-name'] || null,
      parque['@type'] || null,
      geom
    ];

    try {
      await client.query(`
        INSERT INTO parques_jardines (
          id, nombre, url_ficha, distrito, barrio, localidad,
          codigo_postal, direccion, latitud, longitud, descripcion,
          accesibilidad, horario, servicios, nombre_organizacion, 
          descripcion_organizacion, tipo, geom
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15,
          $11, $16, ST_GeomFromText($17, 4326)
        ) ON CONFLICT (id) DO NOTHING
      `, values);
    } catch (err) {
      console.error(`Error insertando parque ID=${parque.id}:`, err.message);
    }
  }

  await client.end();
  console.log('Importación finalizada.');
}

main().catch(err => {
  console.error('Fallo general:', err);
  client.end();
});
