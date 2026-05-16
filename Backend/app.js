const express = require('express');
const cors = require('cors');
const path = require('path');
const rutas = require('./index');

const app = express();
const puerto = 3000;

app.use(cors()); 
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'Frontend')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', rutas);
app.listen(puerto, () => {
    console.log(`Servidor corriendo en: http://localhost:${puerto}`);
});
