

document.addEventListener("DOMContentLoaded", async () => {
  const eventosContainer = document.getElementById("eventosContainer");
  const filtrosAcces = document.querySelectorAll(".filter-accesibilidad");
  const filtrosTipo = document.querySelectorAll(".filter-tipo");
  const filtroGratuito = document.getElementById("filter-gratuito");
  const filtroLarga = document.getElementById("filter-larga");
  const filtroBarrio = document.getElementById("filtroBarrio");

  let eventos = [];

  try {
    const res = await fetch("/api/eventos-culturales");
    eventos = await res.json();
    renderizarEventos(eventos);


    // Rellenar el select de barrios únicos ordenados
    const barriosUnicos = [...new Set(eventos.map(e => e.barrio).filter(Boolean))].sort();
    barriosUnicos.forEach(barrio => {
      const opt = document.createElement("option");
      opt.value = barrio;
      opt.textContent = barrio;
      filtroBarrio.appendChild(opt);
    });

  } catch (err) {
    console.error("Error al cargar eventos:", err);
  }

  function renderizarEventos(lista) {
    eventosContainer.innerHTML = "";
    if (!lista.length) {
      eventosContainer.innerHTML = "<p>No se encontraron eventos.</p>";
      return;
    }

    const grid = document.createElement("div");
    grid.className = "evento-grid";

    lista.forEach(e => {
      const card = document.createElement("div");
      card.className = "evento-card";

      card.innerHTML = `
        <div class="card-header">
          <h3>${e.titulo || 'Sin título'}</h3>
          
        </div>
        <p><span class="tag tipo">${e.tipo_evento?.split("/").pop() || 'General'}</span></p>
        <p><strong>Instalación:</strong> ${e.nombre_instalacion || "Desconocida"}</p>
        <p><strong>Dirección:</strong> ${e.clase_vial || ''} ${e.nombre_via || ''} ${e.num || ''}</p>
        <p><strong>Fecha:</strong> ${e.fecha_inicio?.split("T")[0]} → ${e.fecha_fin?.split("T")[0]}</p>
        <p><strong>Precio:</strong> ${e.precio || "Gratuito"}</p>
        ${e.publico_objetivo ? `<p><strong>Público: </strong></p>${e.publico_objetivo}` : ''}
        ${e.accesibilidad?.length ? `<p><strong>Accesibilidad:</strong> ${e.accesibilidad.join(', ')}</p>` : ''}
        <a href="${e.content_url_actividad}" target="_blank" class="detalle-btn">🔎 Más info</a>
      `;
      grid.appendChild(card);
    });

    eventosContainer.appendChild(grid);
  }

  function filtrar() {
    const barrioSel = filtroBarrio.value;
    const accesSel = [...filtrosAcces].filter(e => e.checked).map(e => e.value);
    const tipoSel = [...filtrosTipo].filter(e => e.checked).map(e => e.value);
    const gratis = filtroGratuito.checked;
    const larga = filtroLarga.checked;

    const filtrados = eventos.filter(e => {
      const a = !accesSel.length || e.accesibilidad?.some(ac => accesSel.includes(ac));
      const t = !tipoSel.length || tipoSel.some(tipo => e.tipo_evento?.includes(tipo));


      const g = !gratis || e.es_gratuito;
      const l = !larga || e.evento_larga_duracion;
      const b = !barrioSel || e.barrio === barrioSel;

      return a && t && g && l && b;
    });

    renderizarEventos(filtrados);
  }



[...filtrosAcces, ...filtrosTipo, filtroGratuito, filtroLarga].forEach(el =>
  el.addEventListener("change", filtrar)
);



});
