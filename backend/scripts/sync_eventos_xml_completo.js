const axios = require('axios');
const xml2js = require('xml2js');
const { Pool } = require('pg');

const API_URL = 'https://datos.madrid.es/egob/catalogo/206974-0-agenda-eventos-culturales-100.xml';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'greenmadrid',
  password: 'postgres',
  port: 5433,
});

const mapaAccesibilidad = {
  '0': 'No accesible',
  '1': 'Accesible',
  '2': 'Parcialmente accesible',
  '3': 'Sin información',
  '4': 'Lengua de signos',
  '5': 'Señalización podotáctil',
  '6': 'Bucle magnético'
};

async function syncEventosCulturalesDesdeXML() {
  try {
    const response = await axios.get(API_URL, {
      headers: { 'Accept': 'application/xml' },
      responseType: 'text'
    });

    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);

    const contenidos = result.Contenidos?.contenido || [];
    const eventos = Array.isArray(contenidos) ? contenidos : [contenidos];

    for (const evento of eventos) {
      const attrs = evento.atributos?.atributo || [];

      const getAttr = (nombre) => {
        if (Array.isArray(attrs)) {
          const match = attrs.find(a => a.$.nombre === nombre);
          return match ? match._ : null;
        } else if (attrs?.$?.nombre === nombre) {
          return attrs._;
        }
        return null;
      };

      const getNestedAttr = (parentName, attrName) => {
        const parent = attrs.find(a => a.$.nombre === parentName);
        if (!parent || !parent.atributo) return null;
        const list = Array.isArray(parent.atributo) ? parent.atributo : [parent.atributo];
        const match = list.find(a => a.$.nombre === attrName);
        return match ? match._ : null;
      };

      const getAccesibilidadInterpretada = () => {
        const raw = getNestedAttr('LOCALIZACION', 'ACCESIBILIDAD');
        if (!raw) return [];
        return raw.split(',').map(code => mapaAccesibilidad[code.trim()] || code.trim());
      };

      const eventoData = {
        event_id_api: getAttr('ID-EVENTO'),
        titulo: getAttr('TITULO') || '',
        descripcion: getAttr('DESCRIPCION') || '',
        enlace: getAttr('CONTENT-URL') || '',
        organizador: '', 
        organizador_url: '',
        fecha_inicio: getAttr('FECHA-EVENTO') || null,
        fecha_fin: getAttr('FECHA-FIN-EVENTO') || null,
        hora_evento: getAttr('HORA-EVENTO') || '',
        latitud: parseFloat(getNestedAttr('LOCALIZACION', 'LATITUD')) || null,
        longitud: parseFloat(getNestedAttr('LOCALIZACION', 'LONGITUD')) || null,
        direccion: getNestedAttr('LOCALIZACION', 'DIRECCION-INSTALACION') || '',
        distrito: getNestedAttr('LOCALIZACION', 'DISTRITO') || '',
        barrio: getNestedAttr('LOCALIZACION', 'BARRIO') || '',
        codigo_postal: getNestedAttr('LOCALIZACION', 'CODIGO-POSTAL') || '',
        tipo_evento: getAttr('TIPO') || '',
        etiquetas: [], 
        publico_objetivo: getAttr('AUDIENCIA') || '',
        rango_edad: '',
        es_gratuito: getAttr('GRATUITO') === '1',
        precio: getAttr('PRECIO') || '',
        evento_larga_duracion: getAttr('EVENTO-LARGA-DURACION') === '1',
        dias_semana: getAttr('DIAS-SEMANA') || '',
        dias_excluidos: getAttr('DIAS-EXCLUIDOS') || '',
        accesibilidad: getAccesibilidadInterpretada(),
        coordenada_x: getNestedAttr('LOCALIZACION', 'COORDENADA-X') || '',
        coordenada_y: getNestedAttr('LOCALIZACION', 'COORDENADA-Y') || '',
        content_url_actividad: getAttr('CONTENT-URL-ACTIVIDAD') || '',
        content_url_instalacion: getNestedAttr('LOCALIZACION', 'CONTENT-URL-INSTALACION') || '',
        nombre_instalacion: getNestedAttr('LOCALIZACION', 'NOMBRE-INSTALACION') || '',
        clase_vial: getNestedAttr('LOCALIZACION', 'CLASE-VIAL') || '',
        nombre_via: getNestedAttr('LOCALIZACION', 'NOMBRE-VIA') || '',
        num: getNestedAttr('LOCALIZACION', 'NUM') || '',
        localidad: getNestedAttr('LOCALIZACION', 'LOCALIDAD') || '',
        provincia: getNestedAttr('LOCALIZACION', 'PROVINCIA') || '',
        tipo: getAttr('TIPO') || ''
      };

      if (!eventoData.event_id_api || !eventoData.fecha_inicio || !eventoData.fecha_fin) continue;

      await pool.query(`
        INSERT INTO eventos_culturales (
          event_id_api, titulo, descripcion, enlace, organizador, organizador_url,
          fecha_inicio, fecha_fin, hora_evento, latitud, longitud, direccion,
          distrito, barrio, codigo_postal, tipo_evento, etiquetas, publico_objetivo,
          rango_edad, es_gratuito, precio, evento_larga_duracion, dias_semana,
          dias_excluidos, accesibilidad, coordenada_x, coordenada_y,
          content_url_actividad, content_url_instalacion, nombre_instalacion,
          clase_vial, nombre_via, num, localidad, provincia, tipo
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
          $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,
          $25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36
        )
        ON CONFLICT (event_id_api) DO UPDATE SET
          titulo = EXCLUDED.titulo,
          descripcion = EXCLUDED.descripcion,
          enlace = EXCLUDED.enlace,
          fecha_inicio = EXCLUDED.fecha_inicio,
          fecha_fin = EXCLUDED.fecha_fin,
          hora_evento = EXCLUDED.hora_evento,
          latitud = EXCLUDED.latitud,
          longitud = EXCLUDED.longitud,
          direccion = EXCLUDED.direccion,
          distrito = EXCLUDED.distrito,
          barrio = EXCLUDED.barrio,
          codigo_postal = EXCLUDED.codigo_postal,
          tipo_evento = EXCLUDED.tipo_evento,
          etiquetas = EXCLUDED.etiquetas,
          publico_objetivo = EXCLUDED.publico_objetivo,
          rango_edad = EXCLUDED.rango_edad,
          es_gratuito = EXCLUDED.es_gratuito,
          precio = EXCLUDED.precio,
          evento_larga_duracion = EXCLUDED.evento_larga_duracion,
          dias_semana = EXCLUDED.dias_semana,
          dias_excluidos = EXCLUDED.dias_excluidos,
          accesibilidad = EXCLUDED.accesibilidad,
          coordenada_x = EXCLUDED.coordenada_x,
          coordenada_y = EXCLUDED.coordenada_y,
          content_url_actividad = EXCLUDED.content_url_actividad,
          content_url_instalacion = EXCLUDED.content_url_instalacion,
          nombre_instalacion = EXCLUDED.nombre_instalacion,
          clase_vial = EXCLUDED.clase_vial,
          nombre_via = EXCLUDED.nombre_via,
          num = EXCLUDED.num,
          localidad = EXCLUDED.localidad,
          provincia = EXCLUDED.provincia,
          tipo = EXCLUDED.tipo,
          ultima_actualizacion = NOW();
      `, Object.values(eventoData));
    }

    await pool.query(`DELETE FROM eventos_culturales WHERE fecha_fin < NOW();`);
    console.log('✅ Sincronización desde XML completada.');
  } catch (error) {
    console.error('❌ Error en la sincronización desde XML:', error.message);
  } finally {
    pool.end();
  }
}

syncEventosCulturalesDesdeXML();
