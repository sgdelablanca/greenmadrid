const map = L.map('map').setView([40.416775, -3.703790], 12); // Centro Madrid

const equipamientosLayer = L.layerGroup().addTo(map);
const fuentesLayer = L.layerGroup().addTo(map);
const areasDeportivasLayer = L.layerGroup().addTo(map);
const areasMayoresLayer = L.layerGroup().addTo(map);
const parquesLayer = L.layerGroup().addTo(map);
const eventosCulturalesLayer = L.layerGroup().addTo(map);



let parquesGlobal = [];



// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);


async function cargarFuentes() {
  try {
    const response = await fetch('http://localhost:3000/api/fuentes');
    const datos = await response.json();

    datos.forEach(fuente => {
      if (!fuente.latitud || !fuente.longitud) return;

      const iconoFuente = L.icon({
        iconUrl: fuente.estado === "OPERATIVO"
          ? 'assets/icons/fuente_operativa.png'
          : 'assets/icons/fuente_no_operativa.png',
        iconSize: [25, 25],
        iconAnchor: [12, 25],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([fuente.latitud, fuente.longitud], { icon: iconoFuente });

      const popup = `
        <strong>${fuente.nom_via} ${fuente.num_via || ''}</strong><br>
        <em>${fuente.barrio} (${fuente.distrito})</em><br>
        Estado: <b>${fuente.estado}</b><br>
        Modelo: ${fuente.modelo || 'Desconocido'}
      `;

      marker.bindPopup(popup);
      marker.addTo(fuentesLayer);
    });

  } catch (error) {
    console.error('Error al cargar fuentes:', error);
  }
}


async function cargarAreasDeportivas() {
  try {
    const response = await fetch('http://localhost:3000/api/areas-deportivas');
    const datos = await response.json();

    datos.forEach(area => {
      if (!area.latitud || !area.longitud) return;

      const iconoArea = L.icon({
        iconUrl: 'assets/icons/area_deportiva.png',
        iconSize: [25, 25],
        iconAnchor: [12, 25],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([area.latitud, area.longitud], { icon: iconoArea });

      const popup = `
        <strong>${area.desc_clasificacion}</strong><br>
        <em>${area.barrio} (${area.distrito})</em><br>
        Ubicación: ${area.tipo_via} ${area.nom_via} ${area.num_via || ''}
      `;

      marker.bindPopup(popup);
      marker.addTo(areasDeportivasLayer);
    });

  } catch (error) {
    console.error('Error al cargar áreas deportivas:', error);
  }
}


async function cargarAreasMayores() {
  try {
    const response = await fetch('http://localhost:3000/api/areas-mayores');
    const datos = await response.json();

    datos.forEach(area => {
      if (!area.latitud || !area.longitud) return;

      const icono = L.icon({
        iconUrl: 'assets/icons/area_mayores.png',
        iconSize: [25, 25],
        iconAnchor: [12, 25],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([area.latitud, area.longitud], { icon: icono });

      const popup = `
        <strong>${area.desc_clasificacion}</strong><br>
        <em>${area.barrio} (${area.distrito})</em><br>
        Dirección: ${area.direccion_aux || 'Desconocida'}
      `;

      marker.bindPopup(popup);
      marker.addTo(areasMayoresLayer);
    });
  } catch (error) {
    console.error('Error al cargar áreas mayores:', error);
  }
}


async function cargarParques() {
  try {
    const response = await fetch('http://localhost:3000/api/parques');
    parquesGlobal = await response.json();
    filtrarParques(); // filtra y pinta
  } catch (err) {
    console.error('Error al cargar parques:', err);
  }
}

function filtrarParques() {
  parquesLayer.clearLayers();

  const accesibilidadChecks = [...document.querySelectorAll('.filter-accesibilidad:checked')].map(e => e.value);


  const iconoParque = L.icon({
    iconUrl: 'assets/icons/parque.png',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -20]
  });

  parquesGlobal.forEach(parque => {
    if (!parque.latitud || !parque.longitud) return;
    


    if (
      accesibilidadChecks.length &&
      !parque.accesibilidad.some(a => accesibilidadChecks.includes(a))
    ) return;

    const popup = `
      <div style="max-width: 270px;">
        <strong>${parque.nombre}</strong><br>
        <em><b>Barrio:</b> ${parque.barrio || "Desconocido"}</em><br>
        <b>Dirección:</b> ${parque.direccion || "No disponible"}<br>
        ${parque.descripcion && parque.descripcion.length > 150
          ? `<p>${parque.descripcion.slice(0, 150)}... <a href='detalle_parque.html?id=${parque.id}'><b>ver más</b></a></p>`
          : `<p>${parque.descripcion || "Sin descripción disponible"}</p>`}
        <b>Horario:</b> ${parque.horario ? "Tiene horario" : "Sin horario"}<br>
        <a href="detalle_parque.html?id=${parque.id}" target="_blank" style="
          display: inline-block;
          margin-top: 6px;
          padding: 5px 10px;
          background: #111;
          color: white;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
        ">🔍 Ver más detalles</a>
      </div>
    `;

    const marker = L.marker([parque.latitud, parque.longitud], { icon: iconoParque });
    marker.bindPopup(popup);
    marker.addTo(parquesLayer);
  });
}







let eventosCulturalesGlobal = [];

function filtrarEventos() {
  const accesibilidadChecks = [...document.querySelectorAll('.filter-accesibilidad:checked')].map(e => e.value);

  const tipoChecks = [...document.querySelectorAll('.filter-tipo:checked')].map(e => e.value);
  const gratuito = document.getElementById('filter-gratuito').checked;
  const largaDuracion = document.getElementById('filter-larga').checked;

  eventosCulturalesLayer.clearLayers();

  eventosCulturalesGlobal.forEach(e => {
    if (!e.latitud || !e.longitud) return;




    if (accesibilidadChecks.length && !e.accesibilidad.some(a => accesibilidadChecks.includes(a))) return;
    if (tipoChecks.length && !tipoChecks.some(t => e.tipo_evento?.includes(t))) return;
    if (gratuito && !e.es_gratuito) return;
    if (largaDuracion && !e.evento_larga_duracion) return;

    const iconoEvento = L.icon({
      iconUrl: 'assets/icons/eventos_culturales.png',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -25]
    });

    const popup = `
      <strong>${e.titulo || 'Evento sin título'}</strong><br>
      <em><b>Fechas:</b> ${e.fecha_inicio?.split('T')[0]} → ${e.fecha_fin?.split('T')[0]}</em><br>
      ${e.hora_evento ? `<b>Hora:</b> ${e.hora_evento}<br>` : ''}
      ${e.precio ? `<b>Precio:</b> ${e.precio}<br>` : ''}
      ${e.tipo_evento ? `<b>Tipo:</b> ${e.tipo_evento.split('/').pop()}<br>` : ''}
      ${e.publico_objetivo ? `<b>Público:</b> ${e.publico_objetivo}<br>` : ''}
      ${e.distrito || e.barrio ? `<b>Zona:</b> ${e.barrio || ''} (${e.distrito || ''})<br>` : ''}
      ${e.accesibilidad?.length ? `<b>Accesibilidad:</b> ${e.accesibilidad.join(', ')}<br>` : ''}
      ${e.descripcion ? `<p>${e.descripcion}</p>` : ''}
      ${e.enlace ? `<a href="${e.enlace}" target="_blank">🌐 Ver en Madrid.es</a><br>` : ''}
    `;

    const marker = L.marker([e.latitud, e.longitud], { icon: iconoEvento });
    marker.bindPopup(popup);
    marker.addTo(eventosCulturalesLayer);
  });
}

async function cargarEventosCulturales() {
  try {
    const response = await fetch('http://localhost:3000/api/eventos-culturales');
    eventosCulturalesGlobal = await response.json();
    filtrarEventos();
  } catch (err) {
    console.error('Error al cargar eventos culturales:', err);
  }
}

/*
function rellenarBarriosUnicos() {
  barrioFilter.innerHTML = '<option value="">Todos los barrios</option>'; // resetea
  const barriosParques = parquesGlobal.map(p => p.barrio);
  const barriosEventos = eventosCulturalesGlobal.map(e => e.barrio);
  const todos = [...new Set([...barriosParques, ...barriosEventos].filter(Boolean))].sort();

  todos.forEach(barrio => {
    const opt = document.createElement("option");
    opt.value = barrio;
    opt.textContent = barrio;
    barrioFilter.appendChild(opt);
  });
}

*/






// Equipamientos
fetch('http://localhost:3000/api/equipamientos')
  .then(response => response.json())
  .then(data => {
    data.forEach(eq => {
      let color = eq.tipo === 'fuente' ? 'blue' : 'green';
      const icon = L.icon({
        iconUrl: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
      const marker = L.marker([eq.lat, eq.lon], { icon })
        .bindPopup(`<b>${eq.tipo}</b><br>${eq.descripcion}`);
      marker.addTo(equipamientosLayer);
    });
  })
  .catch(err => console.error('Error cargando equipamientos:', err));





////////////////////////////////////////////////
//toggle
////////////////////////////////////////////////




document.getElementById('toggleEquipamientos').addEventListener('change', (e) => {
  if (e.target.checked) {
    equipamientosLayer.addTo(map);
  } else {
    map.removeLayer(equipamientosLayer);
  }
});


document.getElementById('toggleFuentes').addEventListener('change', (e) => {
  if (e.target.checked) {
    fuentesLayer.addTo(map);
  } else {
    map.removeLayer(fuentesLayer);
  }
});
cargarFuentes();

document.getElementById('toggleAreasDeportivas').addEventListener('change', (e) => {
  if (e.target.checked) {
    areasDeportivasLayer.addTo(map);
  } else {
    map.removeLayer(areasDeportivasLayer);
  }
});
cargarAreasDeportivas();

document.getElementById('toggleAreasMayores').addEventListener('change', (e) => {
  if (e.target.checked) {
    areasMayoresLayer.addTo(map);
  } else {
    map.removeLayer(areasMayoresLayer);
  }
});
cargarAreasMayores();


document.getElementById('toggleParques').addEventListener('change', (e) => {
  if (e.target.checked) {
    parquesLayer.addTo(map);
  } else {
    map.removeLayer(parquesLayer);
  }
});
cargarParques();


document.getElementById('toggleEventosCulturales').addEventListener('change', (e) => {
  if (e.target.checked) {
    eventosCulturalesLayer.addTo(map);
  } else {
    map.removeLayer(eventosCulturalesLayer);
  }
});
cargarEventosCulturales();

document.querySelectorAll('.filter-accesibilidad, .filter-tipo').forEach(input => {
  input.addEventListener('change', filtrarEventos);
});
document.getElementById('filter-gratuito').addEventListener('change', filtrarEventos);
document.getElementById('filter-larga').addEventListener('change', filtrarEventos);

cargarEventosCulturales();

/*
async function iniciar() {
  await cargarParques();              // carga parques y guarda en parquesGlobal
  await cargarEventosCulturales();   // carga eventos y guarda en eventosCulturalesGlobal
  rellenarBarriosUnicos();           // genera el select con todos los barrios únicos
}
iniciar();
*/

document.querySelectorAll('.filter-accesibilidad').forEach(input => {
  input.addEventListener('change', filtrarParques);
});

barrioFilter.addEventListener("change", () => {
  filtrarParques();
  filtrarEventos();
});
