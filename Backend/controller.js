const baseDatos = require('./database');

exports.obtenerUsuarios = (peticion, respuesta) => {
    baseDatos.all("SELECT * FROM usuarios", [], (e, filas) => {
        respuesta.json(filas);
    });
};

exports.crearUsuarios = (peticion, respuesta) => {
    const { nombre } = peticion.body;
    baseDatos.run("INSERT INTO usuarios (nombre) VALUES (?)", [nombre], function() {
        respuesta.json({ id: this.lastID, nombre });
    });
};

exports.actualizarUsuario = (peticion, respuesta) => {
    const { nombre } = peticion.body;
    baseDatos.run("UPDATE usuarios SET nombre = ? WHERE id = ?", [nombre, peticion.params.id], function() {
        respuesta.json({ mensaje: "Usuario actualizado" });
    });
};

exports.borrarUsuario = (peticion, respuesta) => {
    baseDatos.run("DELETE FROM usuarios WHERE id = ?", [peticion.params.id], function() {
        respuesta.json({ mensaje: "Eliminado" });
    });
};

exports.obtenerLibros = (peticion, respuesta) => {
    const sql = `SELECT libros.*, usuarios.nombre as dueño FROM libros 
                 LEFT JOIN usuarios ON libros.usuarioId = usuarios.id`;
    baseDatos.all(sql, [], (e, filas) => {
        respuesta.json(filas);
    });
};

exports.crearLibros = (peticion, respuesta) => {
    const { titulo, autor, usuarioId } = peticion.body;
    baseDatos.run("INSERT INTO libros (titulo, autor, usuarioId) VALUES (?, ?, ?)", [titulo, autor, usuarioId], function() {
        respuesta.json({ id: this.lastID, titulo, autor });
    });
};

exports.actualizarLibros = (peticion, respuesta) => {
    const { titulo, autor, usuarioId } = peticion.body;
    baseDatos.run("UPDATE libros SET titulo = ?, autor = ?, usuarioId = ? WHERE id = ?", [titulo, autor, usuarioId, peticion.params.id], function() {
        respuesta.json({ mensaje: "Libro actualizado" });
    });
};

exports.borrarLibros = (peticion, respuesta) => {
    baseDatos.run("DELETE FROM libros WHERE id = ?", [peticion.params.id], function() {
        respuesta.json({ mensaje: "Libro eliminado" });
    });
};