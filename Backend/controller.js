const baseDatos = require('./database');
const respuestas = require('./responses');

exports.obtenerUsuarios = (peticion, respuesta) => {
    baseDatos.all('SELECT * FROM usuarios', [], function(error, filas) {
        if (error) {
            return respuestas.badRequest(
                respuesta,
                'No se pudieron obtener los usuarios',
                error.message
            );
        }

        return respuestas.ok(
            respuesta,
            filas,
            'Usuarios obtenidos correctamente'
        );
    });
};

exports.crearUsuarios = (peticion, respuesta) => {
    const { nombre } = peticion.body;

    baseDatos.run('INSERT INTO usuarios (nombre) VALUES (?)', [nombre], function(error) {
        if (error) {
            return respuestas.badRequest(
                respuesta,
                'No se pudo crear el usuario',
                error.message
            );
        }

        return respuestas.created(
            respuesta,
            { id: this.lastID, nombre },
            'Usuario creado correctamente'
        );
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
                    `No existe ningun usuario con id ${id}`
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
    const { id } = peticion.params;

    baseDatos.run('DELETE FROM usuarios WHERE id = ?', [id], function(error) {
        if (error) {
            return respuestas.badRequest(
                respuesta,
                'No se pudo borrar el usuario',
                error.message
            );
        }

        if (this.changes === 0) {
            return respuestas.notFound(
                respuesta,
                `No existe ningun usuario con id ${id}`
            );
        }

        return respuestas.ok(
            respuesta,
            { id },
            'Usuario eliminado correctamente'
        );
    });
};

exports.obtenerLibros = (peticion, respuesta) => {
    const sql = `SELECT libros.*, usuarios.nombre as dueno FROM libros
                 LEFT JOIN usuarios ON libros.usuarioId = usuarios.id`;

    baseDatos.all(sql, [], function(error, filas) {
        if (error) {
            return respuestas.badRequest(
                respuesta,
                'No se pudieron obtener los libros',
                error.message
            );
        }

        return respuestas.ok(
            respuesta,
            filas,
            'Libros obtenidos correctamente'
        );
    });
};

exports.crearLibros = (peticion, respuesta) => {
    const { titulo, autor, usuarioId } = peticion.body;

    baseDatos.run(
        'INSERT INTO libros (titulo, autor, usuarioId) VALUES (?, ?, ?)',
        [titulo, autor, usuarioId],
        function(error) {
            if (error) {
                return respuestas.badRequest(
                    respuesta,
                    'No se pudo crear el libro',
                    error.message
                );
            }

            return respuestas.created(
                respuesta,
                { id: this.lastID, titulo, autor, usuarioId },
                'Libro creado correctamente'
            );
        }
    );
};

exports.actualizarLibros = (peticion, respuesta) => {
    const { titulo, autor, usuarioId } = peticion.body;
    const { id } = peticion.params;

    baseDatos.run(
        'UPDATE libros SET titulo = ?, autor = ?, usuarioId = ? WHERE id = ?',
        [titulo, autor, usuarioId, id],
        function(error) {
            if (error) {
                return respuestas.badRequest(
                    respuesta,
                    'No se pudo actualizar el libro',
                    error.message
                );
            }

            if (this.changes === 0) {
                return respuestas.notFound(
                    respuesta,
                    `No existe ningun libro con id ${id}`
                );
            }

            return respuestas.ok(
                respuesta,
                { id, titulo, autor, usuarioId },
                'Libro actualizado correctamente'
            );
        }
    );
};

exports.borrarLibros = (peticion, respuesta) => {
    const { id } = peticion.params;

    baseDatos.run('DELETE FROM libros WHERE id = ?', [id], function(error) {
        if (error) {
            return respuestas.badRequest(
                respuesta,
                'No se pudo borrar el libro',
                error.message
            );
        }

        if (this.changes === 0) {
            return respuestas.notFound(
                respuesta,
                `No existe ningun libro con id ${id}`
            );
        }

        return respuestas.ok(
            respuesta,
            { id },
            'Libro eliminado correctamente'
        );
    });
};
