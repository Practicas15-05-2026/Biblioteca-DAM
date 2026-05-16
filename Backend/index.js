const express = require('express');
const ruta = express.Router();
const controller = require('./controller');
const subirImagen = require('./image');

ruta.get('/usuarios', controller.obtenerUsuarios);
ruta.post('/usuarios', controller.crearUsuarios);
ruta.put('/usuarios/:id', controller.actualizarUsuario);
ruta.delete('/usuarios/:id', controller.borrarUsuario);

ruta.get('/libros', controller.obtenerLibros);
ruta.post('/libros', subirImagen.single('imagen'), controller.crearLibros);
ruta.put('/libros/:id', subirImagen.single('imagen'), controller.actualizarLibros);
ruta.delete('/libros/:id', controller.borrarLibros);

module.exports = ruta;
