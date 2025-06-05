const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../data/equipamientos.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error leyendo equipamientos' });
    }
    const equipamientos = JSON.parse(data);
    res.json(equipamientos);
  });
});

module.exports = router;
