/*
const pathname = window.location.pathname.split("/").pop(); 


document.addEventListener("DOMContentLoaded", async () => {

  if (pathname.includes("detalle_parque.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (!id) {
      alert("Parque no especificado.");
      return;
    }

    try {
      const res = await fetch(`/api/parques/${id}`);
      if (!res.ok) throw new Error("No se encontró el parque");

      const parque = await res.json();
      document.getElementById("nombre").textContent = parque.nombre;
      document.getElementById("direccion").textContent = parque.direccion || "No disponible";
      document.getElementById("barrio").textContent = parque.barrio || "No disponible";
      document.getElementById("distrito").textContent = parque.distrito || "No disponible";
      document.getElementById("horario").textContent = parque.horario || "No disponible";
      document.getElementById("accesibilidad").textContent = parque.accesibilidad || "No disponible";
      document.getElementById("servicios").textContent = parque.servicios || "No disponible";
      document.getElementById("descripcion").innerHTML = parque.descripcion || "No disponible";
      document.getElementById("org").textContent = parque.nombre_organizacion || "No disponible";

      const imgEl = document.getElementById("imagen-parque");
      imgEl.src = `/api/parques/${parque.id}/imagen`;
      imgEl.onerror = () => {
        imgEl.src = "assets/img/parques/default.jpg";
      };


      const ficha = document.getElementById("url_ficha");
      if (parque.url_ficha) {
        ficha.href = parque.url_ficha;
        ficha.style.display = "inline-block";
      } else {
        ficha.style.display = "none";
      }

      if (parque.latitud && parque.longitud) {
        const map = L.map("map").setView([parseFloat(parque.latitud), parseFloat(parque.longitud)], 16);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
        }).addTo(map);

        L.marker([parseFloat(parque.latitud), parseFloat(parque.longitud)])
          .addTo(map)
          .bindPopup(parque.nombre)
          .openPopup();
      }
    } catch (err) {
      console.error(err);
      alert("Error al cargar el parque.");
    }
  }


if (pathname === "parques.html") {

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
/*
    async function fetchParques(params = {}) {
      const url = new URL("/api/parques", window.location.origin);
      Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));

      const res = await fetch(url);
      const data = await res.json();
      renderParques(data);
    }
*//*
    async function fetchParques(params = {}) {
      try {
        const url = new URL("/api/parques", window.location.origin);
        Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));

        const res = await fetch(url);
        const data = await res.json();
        renderParques(data);
      } catch (error) {
        console.error("❌ Error al cargar parques:", error);
        parquesContainer.innerHTML = `<p>Error al cargar los parques. Intenta de nuevo más tarde.</p>`;
      }
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


    await cargarBarrios();
    await fetchParques();

    
    ordenarSelect.addEventListener("change", () => {
      fetchParques({ order: ordenarSelect.value, barrio: barrioSelect.value });
    });

    barrioSelect.addEventListener("change", () => {
      fetchParques({ order: ordenarSelect.value, barrio: barrioSelect.value });
    });
  }
});
*/