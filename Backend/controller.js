const baseDatos = require('./database');
const respuestas = require('./responses');

function validarTextoObligatorio(datos, campo, nombreLegible) {
    const valor = datos[campo];

    if (valor === undefined || valor === null) {
        return `El campo ${nombreLegible} es obligatorio`;
    }

    if (typeof valor !== 'string') {
        return `El campo ${nombreLegible} debe ser texto`;
    }

    if (valor.trim() === '') {
        return `El campo ${nombreLegible} es obligatorio`;
    }

    if (/^-?\d+$/.test(valor.trim())) {
        return `El campo ${nombreLegible} no puede ser solo numeros`;
    }

    return null;
}

function validarTextoOpcional(datos, campo, nombreLegible) {
    const valor = datos[campo];

    if (valor === undefined || valor === null || valor === '') {
        return null;
    }

    if (typeof valor !== 'string') {
        return `El campo ${nombreLegible} debe ser texto`;
    }

    return null;
}

function validarCampos(datos, campos) {
    const errores = {};

    campos.forEach(({ campo, nombre, obligatorio }) => {
        const error = obligatorio
            ? validarTextoObligatorio(datos, campo, nombre)
            : validarTextoOpcional(datos, campo, nombre);

        if (error) errores[campo] = error;
    });

    return errores;
}

function validarUsuario(datos) {
    return validarCampos(datos, [
        { campo: 'nombre', nombre: 'nombre', obligatorio: true },
        { campo: 'apellido', nombre: 'apellido', obligatorio: true },
        { campo: 'dni', nombre: 'dni', obligatorio: true },
        { campo: 'email', nombre: 'email', obligatorio: true },
        { campo: 'telefono', nombre: 'telefono', obligatorio: false }
    ]);
}

function validarLibro(datos) {
    return validarCampos(datos, [
        { campo: 'titulo', nombre: 'titulo', obligatorio: true },
        { campo: 'autor', nombre: 'autor', obligatorio: true }
    ]);
}

function tieneErrores(errores) {
    return Object.keys(errores).length > 0;
}

exports.obtenerUsuarios = (peticion, respuesta) => {
    baseDatos.all('SELECT id, nombre, apellido, Dni AS dni, email, telefono FROM usuarios', [], function(error, filas) {
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
    const { nombre, apellido, dni, email, telefono } = peticion.body;
    const errores = validarUsuario(peticion.body);

    if (tieneErrores(errores)) {
        return respuestas.badRequest(
            respuesta,
            'Hay campos incorrectos',
            errores
        );
    }

    const telefonoNormalizado = telefono && telefono.trim() !== '' ? telefono.trim() : null;

    baseDatos.run(
        'INSERT INTO usuarios (nombre, apellido, Dni, email, telefono) VALUES (?, ?, ?, ?, ?)',
        [nombre.trim(), apellido.trim(), dni.trim(), email.trim(), telefonoNormalizado],
        function(error) {
            if (error) {
                return respuestas.badRequest(
                    respuesta,
                    'No se pudo crear el usuario',
                    error.message
                );
            }

            return respuestas.created(
                respuesta,
                { id: this.lastID, nombre: nombre.trim(), apellido: apellido.trim(), dni: dni.trim(), email: email.trim(), telefono: telefonoNormalizado },
                'Usuario creado correctamente'
            );
        }
    );
};

exports.actualizarUsuario = (peticion, respuesta) => {
    const { nombre, apellido, dni, email, telefono } = peticion.body;
    const { id } = peticion.params;
    const errores = validarUsuario(peticion.body);

    if (tieneErrores(errores)) {
        return respuestas.badRequest(
            respuesta,
            'Hay campos incorrectos',
            errores
        );
    }

    const telefonoNormalizado = telefono && telefono.trim() !== '' ? telefono.trim() : null;

    baseDatos.run(
        'UPDATE usuarios SET nombre = ?, apellido = ?, Dni = ?, email = ?, telefono = ? WHERE id = ?',
        [nombre.trim(), apellido.trim(), dni.trim(), email.trim(), telefonoNormalizado, id],
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
                { id, nombre: nombre.trim(), apellido: apellido.trim(), dni: dni.trim(), email: email.trim(), telefono: telefonoNormalizado },
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
    const errores = validarLibro(peticion.body);
    const usuarioIdNormalizado = usuarioId || null;
    const imagen = peticion.file ? `/uploads/${peticion.file.filename}` : null;

    if (tieneErrores(errores)) {
        return respuestas.badRequest(
            respuesta,
            'Hay campos incorrectos',
            errores
        );
    }

    baseDatos.run(
        'INSERT INTO libros (titulo, autor, usuarioId, imagen) VALUES (?, ?, ?, ?)',
        [titulo.trim(), autor.trim(), usuarioIdNormalizado, imagen],
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
                { id: this.lastID, titulo: titulo.trim(), autor: autor.trim(), usuarioId: usuarioIdNormalizado, imagen },
                'Libro creado correctamente'
            );
        }
    );
};

exports.actualizarLibros = (peticion, respuesta) => {
    const { titulo, autor, usuarioId } = peticion.body;
    const { id } = peticion.params;
    const errores = validarLibro(peticion.body);
    const usuarioIdNormalizado = usuarioId || null;
    const imagen = peticion.file ? `/uploads/${peticion.file.filename}` : null;

    if (tieneErrores(errores)) {
        return respuestas.badRequest(
            respuesta,
            'Hay campos incorrectos',
            errores
        );
    }

    baseDatos.run(
        'UPDATE libros SET titulo = ?, autor = ?, usuarioId = ?, imagen = COALESCE(?, imagen) WHERE id = ?',
        [titulo.trim(), autor.trim(), usuarioIdNormalizado, imagen, id],
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
                { id, titulo: titulo.trim(), autor: autor.trim(), usuarioId: usuarioIdNormalizado, imagen },
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


