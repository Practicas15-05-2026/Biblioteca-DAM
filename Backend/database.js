const sqlite3 = require('sqlite3').verbose();
const baseDatos = new sqlite3.Database('./proyecto.baseDatos');

baseDatos.serialize(() => {
    baseDatos.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL
    )`);

    baseDatos.run(`CREATE TABLE IF NOT EXISTS libros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        autor TEXT NOT NULL,
        usuarioId INTEGER,
        FOREIGN KEY (usuarioId) REFERENCES usuarios (id)
    )`);
});

module.exports = baseDatos;