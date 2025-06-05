const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.static('frontend'));
app.use('/assets/img', express.static('frontend/assets/img'));
app.use(express.static(path.join(__dirname, 'public')));




// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/parques', require('./routes/parques'));


const parquesRoute = require('./routes/parques');
app.use('/api/parques', parquesRoute);

const equipamientosRoute = require('./routes/equipamientos');
app.use('/api/equipamientos', equipamientosRoute);

//const eventosRoute = require('./routes/eventos');
//app.use('/api/eventos', eventosRoute);

const areasDeportivasRoute = require('./routes/areas_deportivas');
app.use('/api/areas-deportivas', areasDeportivasRoute);

const areasMayoresRoute = require('./routes/areas_mayores.routes');
app.use('/api/areas-mayores', areasMayoresRoute);

const eventosCulturalesRoutes = require('./routes/eventos_culturales.routes');
app.use('/api/eventos-culturales', eventosCulturalesRoutes);



app.use(express.static(path.join(__dirname, '../frontend')));

const parquesImagenRoutes = require('./routes/parques.imagen.routes');
app.use('/api/parques', parquesImagenRoutes); 


// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor GreenMadrid funcionando correctamente 🚀');
});

// Importa y usa la ruta de fuentes
const fuentesRoutes = require('./routes/fuentes.routes');
app.use('/api/fuentes', fuentesRoutes);


// Puerto
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

