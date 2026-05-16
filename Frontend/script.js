const API_URL = 'http://localhost:3000/api/usuarios';
const LIBROS_URL = 'http://localhost:3000/api/libros';

function mensajePorEstado(status) {
    if (status === 400) return trad('errorDatosInvalidos');
    if (status === 404) return trad('errorRecursoNoExiste');
    if (status >= 200 && status < 300) return trad('operacionCorrecta');
    return trad('errorInesperado');
}

function mostrarMensaje(mensaje, tipo = 'info') {
    let contenedor = document.getElementById('mensaje-estado');

    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'mensaje-estado';
        const main = document.querySelector('main');
        if (main) main.prepend(contenedor);
    }

    contenedor.className = `mensaje-estado mensaje-${tipo}`;
    contenedor.textContent = mensaje;
}

function limpiarMensaje() {
    const contenedor = document.getElementById('mensaje-estado');
    if (contenedor) contenedor.textContent = '';
}

function manejarError(error) {
    console.error(error);

    if (error.status === 400) {
        mostrarMensaje(error.message, 'error');
        return;
    }

    if (error.status === 404) {
        mostrarMensaje(error.message, 'warning');
        return;
    }

    mostrarMensaje(trad('errorConexion'), 'error');
}

async function procesarRespuesta(respuesta) {
    let cuerpo = {};

    try {
        cuerpo = await respuesta.json();
    } catch (error) {
        cuerpo = {};
    }

    if (respuesta.ok) {
        return cuerpo;
    }

    const error = new Error(cuerpo.mensaje || mensajePorEstado(respuesta.status));
    error.status = respuesta.status;
    error.codigo = cuerpo.error;
    error.detalles = cuerpo.detalles;
    throw error;
}

function obtenerDatos(cuerpo) {
    if (Array.isArray(cuerpo)) return cuerpo;
    return cuerpo.data || [];
}

function textoSeguro(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

async function cargarUsuarios() {
    const tabla = document.getElementById('cuerpo-tabla-usuarios');
    if (!tabla) return;

    try {
        const cuerpo = await fetch(API_URL).then(procesarRespuesta);
        const usuarios = obtenerDatos(cuerpo);

        tabla.innerHTML = usuarios.map(usuario => `
            <tr>
                <td class="columna">${textoSeguro(usuario.nombre)}</td>
                <td class="columna-boton">
                    <button class="boton boton-editar" onclick="window.location.href='usuarios.html?id=${usuario.id}&nombre=${encodeURIComponent(usuario.nombre)}'">${trad('editar')}</button>
                    <button class="boton boton-borrar" onclick="eliminar(${usuario.id})">${trad('eliminar')}</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        manejarError(error);
        tabla.innerHTML = `
            <tr>
                <td class="columna" colspan="2">${trad('errorUsuarios')}</td>
            </tr>
        `;
    }
}

function prepararEdicion(id, nombre) {
    if (!id || !nombre) {
        const params = new URLSearchParams(window.location.search);
        id = params.get('id');
        nombre = params.get('nombre');
    }

    if (!id || !nombre) return;

    document.getElementById('usuario-id').value = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('titulo-formulario').innerText = trad('editarUsuario');
    document.getElementById('boton-enviar').innerText = trad('actualizar');
}

function limpiarformulario() {
    document.getElementById('usuario-id').value = '';
    document.getElementById('nombre').value = '';
    window.location.href = 'usuarios-list.html'
}

const usuarioFormulario = document.getElementById('usuario-formulario');
if (usuarioFormulario) {
    usuarioFormulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        limpiarMensaje();

        const id = document.getElementById('usuario-id').value;
        const nombre = document.getElementById('nombre').value;
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        try {
            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre })
            });
            const cuerpo = await procesarRespuesta(respuesta);

            mostrarMensaje(cuerpo.mensaje || mensajePorEstado(respuesta.status), 'success');
            limpiarformulario();
            cargarUsuarios();
            actualizarSeleccionUsuarios();
        } catch (error) {
            manejarError(error);
        }
    });
}

async function eliminar(id) {
    if (!confirm(trad('confirmar'))) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const cuerpo = await procesarRespuesta(respuesta);

        mostrarMensaje(cuerpo.mensaje || mensajePorEstado(respuesta.status), 'success');
        cargarUsuarios();
        actualizarSeleccionUsuarios();
    } catch (error) {
        manejarError(error);
    }
}

async function cargarLibros() {
    const tabla = document.getElementById('tablas-libro');
    if (!tabla) return;

    try {
        const cuerpo = await fetch(LIBROS_URL).then(procesarRespuesta);
        const libros = obtenerDatos(cuerpo);

        tabla.innerHTML = libros.map(libro => `
            <div class="card mb-3" style="max-width: 540px;">
                <div class="row g-0">
                    <div class="col-md-4">
                        ${libro.imagen
                            ? `<img src="${textoSeguro(libro.imagen)}" class="img-fluid rounded-start" alt="${textoSeguro(libro.titulo)}">`
                            : `<span>${trad('sinImagen')}</span>`
                        }
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${textoSeguro(libro.titulo)}</h5>
                            <p class="card-text">${trad('autor')} : ${textoSeguro(libro.autor)}</p>
                            <p class="card-text"><small class="text-body-secondary">${trad('dueno')} : ${textoSeguro(libro.dueno || trad('sinAsignar'))}</small></p>
                            <div>
                                <button class="boton boton-editar"
                                    onclick="window.location.href='registrar-libros.html?id=${libro.id}&titulo=${encodeURIComponent(libro.titulo)}&autor=${encodeURIComponent(libro.autor)}&usuarioId=${libro.usuarioId || ''}'">
                                    ${trad('editar')}
                                </button>
                                <button class="boton boton-borrar" onclick="eliminarLibro(${libro.id})">${trad('eliminar')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        manejarError(error);
        tabla.innerHTML = `
            <tr>
                <td class="columna" colspan="5">${trad('errorLibros')}</td>
            </tr>
        `;
    }
}

function prepararEdicionLibro(id, titulo, autor, usuarioId) {
    if (!id) {
        const params = new URLSearchParams(window.location.search);
        id = params.get('id');
        titulo = params.get('titulo');
        autor = params.get('autor');
        usuarioId = params.get('usuarioId');
    }

    if (!id) return;

    document.getElementById('libro-id').value = id;
    document.getElementById('titulo').value = titulo;
    document.getElementById('autor').value = autor;
    document.getElementById('seleccion-usuario').value = usuarioId || '';
    document.getElementById('libro-titulo-formulario').innerText = trad('editarLibro');
    document.getElementById('boton-libro-enviar').innerText = trad('actualizarLibro');
}

function limpiarlibroFormulario() {
    document.getElementById('libro-id').value = '';
    document.getElementById('libro-formulario').reset();
    window.location.href = 'index.html'
}

async function actualizarSeleccionUsuarios() {
    const seleccion = document.getElementById('seleccion-usuario');
    if (!seleccion) return;

    try {
        const cuerpo = await fetch(API_URL).then(procesarRespuesta);
        const usuarios = obtenerDatos(cuerpo);

        seleccion.innerHTML = `<option value="">${trad('sinDueno')}</option>` +
            usuarios.map(usuario => `<option value="${usuario.id}">${textoSeguro(usuario.nombre)}</option>`).join('');
    } catch (error) {
        manejarError(error);
    }
}

const libroFormulario = document.getElementById('libro-formulario');
if (libroFormulario) {
    libroFormulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        limpiarMensaje();

        const id = document.getElementById('libro-id').value;
        const datos = new FormData();
        const imagen = document.getElementById('imagen').files[0];

        datos.append('titulo', document.getElementById('titulo').value);
        datos.append('autor', document.getElementById('autor').value);
        datos.append('usuarioId', document.getElementById('seleccion-usuario').value || '');

        if (imagen) {
            datos.append('imagen', imagen);
        }

        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${LIBROS_URL}/${id}` : LIBROS_URL;

        try {
            const respuesta = await fetch(url, {
                method: metodo,
                body: datos
            });
            const cuerpo = await procesarRespuesta(respuesta);

            mostrarMensaje(cuerpo.mensaje || mensajePorEstado(respuesta.status), 'success');
            limpiarlibroFormulario();
            cargarLibros();
        } catch (error) {
            manejarError(error);
        }
    });
}

async function eliminarLibro(id) {
    if (!confirm(trad('confirmarLibro'))) return;

    try {
        const respuesta = await fetch(`${LIBROS_URL}/${id}`, { method: 'DELETE' });
        const cuerpo = await procesarRespuesta(respuesta);

        mostrarMensaje(cuerpo.mensaje || mensajePorEstado(respuesta.status), 'success');
        cargarLibros();
    } catch (error) {
        manejarError(error);
    }
}

if (document.getElementById('cuerpo-tabla-usuarios')) cargarUsuarios();
if (document.getElementById('tablas-libro')) cargarLibros();
if (document.getElementById('seleccion-usuario')) actualizarSeleccionUsuarios();
if (document.getElementById('libro-formulario')) prepararEdicionLibro();
if (document.getElementById('usuario-formulario')) prepararEdicion();
