const express = require('express');
const cors = require('cors');
const path = require('path');
const rutas = require('./index');

const app = express();
const puerto = 3000;

app.use(cors()); 
app.use(express.json());

app.listen(puerto, () => {
    console.log(`Servidor corriendo en: http://localhost:${puerto}`);
});