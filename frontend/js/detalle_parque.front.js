


document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (!id) {
    alert("No se ha proporcionado un ID válido.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/parques/${id}`);
    if (!response.ok) throw new Error("Error al obtener el parque");

    const parque = await response.json();

    document.getElementById("nombre").textContent = parque.nombre;
    document.getElementById("direccion").textContent = parque.direccion || "No disponible";
    document.getElementById("barrio").textContent = parque.barrio || "No disponible";
    document.getElementById("distrito").textContent = parque.distrito || "No disponible";
    document.getElementById("horario").textContent = parque.horario || "No disponible";
    document.getElementById("accesibilidad").textContent = parque.accesibilidad || "No disponible";
    document.getElementById("servicios").textContent = parque.servicios || "No disponible";
    document.getElementById("descripcion").innerHTML = parque.descripcion || "No disponible";
    document.getElementById("org").textContent = parque.nombre_organizacion || "No disponible";

    
    const ficha = document.getElementById("url_ficha");
    if (ficha && parque.url_ficha) {
      ficha.href = parque.url_ficha;
      ficha.style.display = "inline-block";
    } else if (ficha) {
      ficha.style.display = "none";
    }



    const imgEl = document.getElementById("imagen-parque");
    const temp = new Image();

    temp.onload = () => {
      imgEl.src = temp.src;
      imgEl.classList.add("visible");
    };
    temp.onerror = () => {
      imgEl.src = "assets/img/default.jpg";
      imgEl.classList.add("visible");
    };
    temp.src = `/api/parques/${parque.id}/imagen`;



    
    if (parque.latitud && parque.longitud) {
      const map = L.map("map").setView(
        [parseFloat(parque.latitud), parseFloat(parque.longitud)],
        16
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      L.marker([parseFloat(parque.latitud), parseFloat(parque.longitud)]).addTo(map)
        .bindPopup(parque.nombre).openPopup();

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

  } catch (err) {
    console.error(err);
    alert("No se pudo cargar la información del parque.");
  }
const pathname = window.location.pathname;

  // LISTADO DE PARQUES
  if (pathname.includes("parques.html")) {
    async function cargarBarrios() {
      const res = await fetch("/api/parques/barrios/lista");
      const barrios = await res.json();
      const select = document.getElementById("barrioSelect");
      barrios.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b;
        opt.textContent = b;
        select.appendChild(opt);
      });
    }

    const searchInput = document.getElementById("searchInput");
    const barrioSelect = document.getElementById("barrioSelect");
    const ordenarSelect = document.getElementById("ordenarSelect");
    const parquesContainer = document.getElementById("parquesContainer");
    const suggestionsBox = document.getElementById("suggestions");

    async function fetchParques(params = {}) {
      const url = new URL("/api/parques", window.location.origin);
      Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));

      const res = await fetch(url);
      const data = await res.json();
      renderParques(data);
    }

    function renderParques(parques) {
      parquesContainer.innerHTML = "";
      parques.forEach(p => {
        const card = document.createElement("div");
        card.className = "parque-card";
        card.innerHTML = `
          <h3>${p.nombre}</h3>
          <p><strong>Distrito:</strong> ${p.distrito}</p>
          <p><strong>Barrio:</strong> ${p.barrio}</p>
          <a href="detalle_parque.html?id=${p.id}">🔍 Ver detalles</a>
        `;
        parquesContainer.appendChild(card);
      });
    }

    searchInput.addEventListener("input", async () => {
      const val = searchInput.value.trim();
      if (!val) return suggestionsBox.innerHTML = "";
      const res = await fetch(`/api/parques?search=${val}`);
      const data = await res.json();
      suggestionsBox.innerHTML = data.slice(0, 5).map(p =>
        `<li onclick="location.href='detalle_parque.html?id=${p.id}'">${p.nombre}</li>`).join("");
    });

    ordenarSelect.addEventListener("change", () => {
      fetchParques({ order: ordenarSelect.value, barrio: barrioSelect.value });
    });

    barrioSelect.addEventListener("change", () => {
      fetchParques({ order: ordenarSelect.value, barrio: barrioSelect.value });
    });

    await cargarBarrios();
    await fetchParques();
  }
});



