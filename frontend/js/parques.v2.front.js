
const pathname = window.location.pathname.split("/").pop();

document.addEventListener("DOMContentLoaded", async () => {
  if (pathname === "parques.html") {
    const searchInput = document.getElementById("searchInput");
    const barrioSelect = document.getElementById("barrioSelect");
    const ordenarSelect = document.getElementById("ordenarSelect");
    const parquesContainer = document.getElementById("parquesContainer");
    const suggestionsBox = document.getElementById("suggestions");
    const accesibilidadContainer = document.getElementById("accesibilidadFiltros");

    const opcionesAccesibilidad = [
      "Accesible",
      "Bucle magnético",
      "Señalización podotáctil",
      "Sin información",
      "Parcialmente accesible",
      "No accesible",
      "Lengua de signos"
    ];

    opcionesAccesibilidad.forEach(op => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" class="filtro-acces" value="${op}" /> ${op}
      `;
      accesibilidadContainer.appendChild(label);
    });

    async function cargarBarrios() {
      const res = await fetch("/api/parques/barrios/lista");
      const barrios = await res.json();
      barrios.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b;
        opt.textContent = b;
        barrioSelect.appendChild(opt);
      });
    }

    async function fetchParques(params = {}) {
      const url = new URL("/api/parques", window.location.origin);
      Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));
      const res = await fetch(url);
      const data = await res.json();

      const accesibilidadChecks = [...document.querySelectorAll(".filtro-acces:checked")].map(cb => cb.value);
      const filtered = data.filter(p => {
        if (!accesibilidadChecks.length) return true;
        return p.accesibilidad?.some(a => accesibilidadChecks.includes(a));
      });

      renderParques(filtered);
    }

    function renderParques(parques) {
      parquesContainer.innerHTML = "";

      const wrapper = document.createElement("div");
      wrapper.className = "parque-grid";

      parques.forEach(p => {
        const card = document.createElement("div");
        card.className = "parque-card-v2";
        const imagenSrc = `/api/parques/${p.id}/imagen`;

        const img = document.createElement("img");
        img.className = "card-img";
        img.alt = `Imagen de ${p.nombre}`;
        img.src = imagenSrc;
        img.onerror = () => {
          img.src = "assets/img/parques/default.jpg";
        };

        card.innerHTML = `
          <div class="card-body">
            <h3>${p.nombre}</h3>
            <p><strong>${p.barrio}</strong> (${p.distrito})</p>
            <p><em>${p.direccion || "Sin dirección"}</em></p>
            <p>${(p.descripcion || '').split(" ").slice(0, 18).join(" ")}...</p>
            ${p.accesibilidad?.length ? `<p class="tag">${p.accesibilidad[0]}</p>` : ""}
            <a class="detalle-btn" href="detalle_parque.html?id=${p.id}">🔍 Ver más</a>
          </div>
        `;

        card.insertBefore(img, card.firstChild);
        wrapper.appendChild(card);
      });

      parquesContainer.appendChild(wrapper);
    }

    searchInput.addEventListener("input", async () => {
      const val = searchInput.value.trim();
      if (!val) return (suggestionsBox.innerHTML = "");
      const res = await fetch(`/api/parques?search=${val}`);
      const data = await res.json();
      suggestionsBox.innerHTML = data.slice(0, 5).map(p => `<li onclick="location.href='detalle_parque.html?id=${p.id}'">${p.nombre}</li>`).join("");
    });

    ordenarSelect.addEventListener("change", applyFilters);
    barrioSelect.addEventListener("change", applyFilters);
    document.querySelectorAll(".filtro-acces").forEach(cb => cb.addEventListener("change", applyFilters));

    function applyFilters() {
      const barrio = barrioSelect.value;
      const order = ordenarSelect.value;
      fetchParques({ barrio, order });
    }

    await cargarBarrios();
    await fetchParques();
  }
});
