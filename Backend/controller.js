const baseDatos = require('./database');
const respuestas = require('./responses')

exports.obtenerUsuarios = (peticion, respuesta) => {
    baseDatos.all("SELECT * FROM usuarios", [], function (error, filas){
        if (error){
            return respuestas.badRequest(
                respuesta, 
                'No se pudo obtener',
                error.message
            ) 
        } 
        return respuestas.ok(
            respuesta,
            filas,
        )
    });
};

exports.crearUsuarios = (peticion, respuesta) => {
    const { nombre } = peticion.body;
    baseDatos.run("INSERT INTO usuarios (nombre) VALUES (?)", [nombre], function(error) {
        if (error){
            return respuestasç.badRequest(
                respuestas,
                'No se puedo obtener',
                error.message
            )
        }
        return respuestas.ok(
            respuesta,
            'Usuario se creó correctamente',
        )
    });
};

exports.actualizarUsuario = (peticion, respuesta) => {
    const { nombre } = peticion.body;
    const { id } = peticion.params;

    if (!nombre || nombre.trim() === '') {
        return respuestas.badRequest(
            respuesta,
            'El nombre del usuario es obligatorio'
        );
    }

    baseDatos.run(
        'UPDATE usuarios SET nombre = ? WHERE id = ?',
        [nombre.trim(), id],
        function(error) {
            if (error) {
                return respuestas.badRequest(
                    respuesta,
                    'No se pudo actualizar el usuario',
                    error.message
                );
            }

            if (this.changes === 0) {
                return respuestas.notFound(
                    respuesta,
                    `No existe ningún usuario con id ${id}`
                );
            }

            return respuestas.ok(
                respuesta,
                { id, nombre: nombre.trim() },
                'Usuario actualizado correctamente'
            );
        }
    );
};

exports.borrarUsuario = (peticion, respuesta) => {
    baseDatos.run("DELETE FROM usuarios WHERE id = ?", [peticion.params.id], function() {
        if (this.changes === 0) {
            return respuestas.notFound(
                respuesta,
                `No existe ningún usuario con id ${id}`
            );
        }
        return respuesta.json({});
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