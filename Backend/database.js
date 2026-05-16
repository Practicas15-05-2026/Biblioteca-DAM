const sqlite3 = require('sqlite3').verbose();
const baseDatos = new sqlite3.Database('./proyecto.baseDatos');

baseDatos.serialize(() => {
    baseDatos.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        Dni TEXT NOT NULL,
        email TEXT NOT NULL,
        telefono TEXT
    )`);

    baseDatos.run(`ALTER TABLE usuarios ADD COLUMN apellido TEXT`, (error) => {
        if (error && !error.message.includes('duplicate column name')) {
            console.error(error.message);
        }
    });

    baseDatos.run(`ALTER TABLE usuarios ADD COLUMN Dni TEXT`, (error) => {
        if (error && !error.message.includes('duplicate column name')) {
            console.error(error.message);
        }
    });

    baseDatos.run(`ALTER TABLE usuarios ADD COLUMN email TEXT`, (error) => {
        if (error && !error.message.includes('duplicate column name')) {
            console.error(error.message);
        }
    });

    baseDatos.run(`ALTER TABLE usuarios ADD COLUMN telefono TEXT`, (error) => {
        if (error && !error.message.includes('duplicate column name')) {
            console.error(error.message);
        }
    });

    baseDatos.run(`CREATE TABLE IF NOT EXISTS libros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        autor TEXT NOT NULL,
        usuarioId INTEGER,
        imagen TEXT,
        FOREIGN KEY (usuarioId) REFERENCES usuarios (id)
    )`);

    baseDatos.run(`ALTER TABLE libros ADD COLUMN imagen TEXT`, (error) =>{
        if (error && !error.message.includes('duplicate column name')){
            console.error(error.message)
        }
    })
});

module.exports = baseDatos;
