const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'greenmadrid',
  password: 'postgres',
  port: 5433,
});

const API_URL = 'https://datos.madrid.es/egob/catalogo/300107-0-agenda-eventos-culturales-100.json';


async function syncEventosCulturales() {
  try {
const res = await axios.get(API_URL, {
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0'
  }
});

console.log('Tipo de contenido:', res.headers['content-type']); // útil para depuración
console.log('Primeras claves del body:', Object.keys(res.data));


    const data = res.data;

    const eventos = data['@graph'].filter(e => e['location'] && e['location']['latitude'] && e['location']['longitude']);

    for (const e of eventos) {
      const id = e['@id'];
      const titulo = e.title || '';
      const descripcion = e.description || '';
      const enlace = e.link || '';
      const organizador = e.organization?.organization?.name || '';
      const organizador_url = e.organization?.organization?.url || '';
      const fecha_inicio = e.dtstart || null;
      const fecha_fin = e.dtend || null;
      const lat = parseFloat(e.location.latitude);
      const lon = parseFloat(e.location.longitude);
      const direccion = e.address?.streetAddress || '';
      const distrito = e.address?.addressLocality || '';
      const tipo_evento = e['event-type']?.[0]?.title || '';
      const etiquetas = e.keywords ? e.keywords.split(',').map(k => k.trim()) : [];
      const publico_objetivo = e.audience || '';
      const rango_edad = e['typical-age-range'] || '';
      const es_gratuito = e.free === true;
      const accesibilidad = e.accessibility || [];
      const estado = e['event-status'] || '';

      if (!fecha_inicio || !fecha_fin) continue;

      await pool.query(`
        INSERT INTO eventos_culturales (
          event_id_api, titulo, descripcion, enlace,
          organizador, organizador_url, fecha_inicio, fecha_fin,
          latitud, longitud, direccion, distrito,
          tipo_evento, etiquetas, publico_objetivo, rango_edad,
          es_gratuito, accesibilidad, estado, ultima_actualizacion
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,NOW())
        ON CONFLICT (event_id_api) DO UPDATE SET
          titulo = EXCLUDED.titulo,
          descripcion = EXCLUDED.descripcion,
          enlace = EXCLUDED.enlace,
          organizador = EXCLUDED.organizador,
          organizador_url = EXCLUDED.organizador_url,
          fecha_inicio = EXCLUDED.fecha_inicio,
          fecha_fin = EXCLUDED.fecha_fin,
          latitud = EXCLUDED.latitud,
          longitud = EXCLUDED.longitud,
          direccion = EXCLUDED.direccion,
          distrito = EXCLUDED.distrito,
          tipo_evento = EXCLUDED.tipo_evento,
          etiquetas = EXCLUDED.etiquetas,
          publico_objetivo = EXCLUDED.publico_objetivo,
          rango_edad = EXCLUDED.rango_edad,
          es_gratuito = EXCLUDED.es_gratuito,
          accesibilidad = EXCLUDED.accesibilidad,
          estado = EXCLUDED.estado,
          ultima_actualizacion = NOW();
      `, [id, titulo, descripcion, enlace, organizador, organizador_url, fecha_inicio, fecha_fin, lat, lon,
          direccion, distrito, tipo_evento, etiquetas, publico_objetivo, rango_edad,
          es_gratuito, accesibilidad, estado]);
    }

    await pool.query(`DELETE FROM eventos_culturales WHERE fecha_fin < NOW();`);
    console.log('✅ Sincronización completada con éxito.');
  } catch (err) {
    console.error('❌ Error en la sincronización:', err);
  } finally {
    pool.end();
  }
}

syncEventosCulturales();
