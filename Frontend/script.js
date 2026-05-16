const API_URL = 'http://localhost:3000/api/usuarios';
const LIBROS_URL = 'http://localhost:3000/api/libros';

function mostrarMensaje(mensaje, tipo) {
    let caja = document.getElementById('mensaje-estado');

    if (!caja) {
        caja = document.createElement('div');
        caja.id = 'mensaje-estado';
        document.querySelector('main').prepend(caja);
    }

    caja.className = `mensaje-estado mensaje-${tipo}`;
    caja.textContent = mensaje;
}

function limpiarMensaje() {
    const caja = document.getElementById('mensaje-estado');
    if (caja) caja.textContent = '';
}

async function leerRespuesta(respuesta) {
    const cuerpo = await respuesta.json();
    return cuerpo;
}

function datos(cuerpo) {
    return cuerpo.data || cuerpo;
}

function mensajeErrorPorStatus(status, cuerpo) {
    if (status === 400) return cuerpo.mensaje || 'Error 400: datos invalidos';
    if (status === 404) return cuerpo.mensaje || 'Error 404: recurso no encontrado';
    return cuerpo.mensaje || 'Error inesperado';
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
        const respuesta = await fetch(API_URL);
        const cuerpo = await leerRespuesta(respuesta);

        if (respuesta.status !== 200) {
            mostrarMensaje(mensajeErrorPorStatus(respuesta.status, cuerpo), 'error');
            return;
        }

        const usuarios = datos(cuerpo);

        tabla.innerHTML = usuarios.map(usuario => `
            <tr>
                <td class="columna">${textoSeguro(usuario.nombre)}</td>
                <td class="columna-boton">
                    <button class="boton boton-editar" onclick="window.location.href='usuarios.html?id=${usuario.id}&nombre=${encodeURIComponent(usuario.nombre)}'">Editar</button>
                    <button class="boton boton-borrar" onclick="eliminar(${usuario.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
        mostrarMensaje('No se pudo conectar con el servidor', 'error');
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
    document.getElementById('titulo-formulario').innerText = 'Editar Usuario';
    document.getElementById('boton-enviar').innerText = 'Actualizar';
}

function limpiarformulario() {
    document.getElementById('usuario-id').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('titulo-formulario').innerText = 'Registrar Usuario';
    document.getElementById('boton-enviar').innerText = 'Guardar Usuario';
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
            const cuerpo = await leerRespuesta(respuesta);

            if (respuesta.status === 200 || respuesta.status === 201) {
                mostrarMensaje(cuerpo.mensaje, 'success');
                limpiarformulario();
                cargarUsuarios();
                actualizarSeleccionUsuarios();
            } else if (respuesta.status === 400) {
                mostrarMensaje(mensajeErrorPorStatus(400, cuerpo), 'error');
            } else if (respuesta.status === 404) {
                mostrarMensaje(mensajeErrorPorStatus(404, cuerpo), 'warning');
            }
        } catch (error) {
            console.error(error);
            mostrarMensaje('No se pudo conectar con el servidor', 'error');
        }
    });
}

async function eliminar(id) {
    if (!confirm('Seguro?')) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const cuerpo = await leerRespuesta(respuesta);

        if (respuesta.status === 200) {
            mostrarMensaje(cuerpo.mensaje, 'success');
            cargarUsuarios();
            actualizarSeleccionUsuarios();
        } else if (respuesta.status === 404) {
            mostrarMensaje(mensajeErrorPorStatus(404, cuerpo), 'warning');
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje('No se pudo conectar con el servidor', 'error');
    }
}

async function cargarLibros() {
    const tabla = document.getElementById('tablas-libro');
    if (!tabla) return;

    try {
        const respuesta = await fetch(LIBROS_URL);
        const cuerpo = await leerRespuesta(respuesta);

        if (respuesta.status !== 200) {
            mostrarMensaje(mensajeErrorPorStatus(respuesta.status, cuerpo), 'error');
            return;
        }

        const libros = datos(cuerpo);

        tabla.innerHTML = libros.map(libro => `
            <tr class="block">
                <td class="columna">
                    ${libro.imagen ? `<img class="imagen-libro" src="${textoSeguro(libro.imagen)}" alt="${textoSeguro(libro.titulo)}">` : 'Sin imagen'}
                </td>
                <td class="columna titulo">Titulo: <span>${textoSeguro(libro.titulo)}</span></td>
                <td class="columna">Autor: ${textoSeguro(libro.autor)}</td>
                <td class="columna">Dueno: ${textoSeguro(libro.dueno || 'Sin asignar')}</td>
                <td class="columna-boton">
                    <button class="boton boton-editar" onclick="window.location.href='registrar-libros.html?id=${libro.id}&titulo=${encodeURIComponent(libro.titulo)}&autor=${encodeURIComponent(libro.autor)}&usuarioId=${libro.usuarioId || ''}'">Editar</button>
                    <button class="boton boton-borrar" onclick="eliminarLibro(${libro.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
        mostrarMensaje('No se pudo conectar con el servidor', 'error');
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
    document.getElementById('libro-titulo-formulario').innerText = 'Editar Libro';
    document.getElementById('boton-libro-enviar').innerText = 'Actualizar Libro';
}

function limpiarlibroFormulario() {
    document.getElementById('libro-id').value = '';
    document.getElementById('libro-formulario').reset();
    document.getElementById('libro-titulo-formulario').innerText = 'Registrar Libro';
    document.getElementById('boton-libro-enviar').innerText = 'Guardar Libro';
}

async function actualizarSeleccionUsuarios() {
    const seleccion = document.getElementById('seleccion-usuario');
    if (!seleccion) return;

    try {
        const respuesta = await fetch(API_URL);
        const cuerpo = await leerRespuesta(respuesta);

        if (respuesta.status !== 200) return;

        const usuarios = datos(cuerpo);
        seleccion.innerHTML = '<option value="">Sin dueno</option>' +
            usuarios.map(usuario => `<option value="${usuario.id}">${textoSeguro(usuario.nombre)}</option>`).join('');
    } catch (error) {
        console.error(error);
    }
}

const libroFormulario = document.getElementById('libro-formulario');
if (libroFormulario) {
    libroFormulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        limpiarMensaje();

        const id = document.getElementById('libro-id').value;
        const formData = new FormData();
        const imagen = document.getElementById('imagen').files[0];

        formData.append('titulo', document.getElementById('titulo').value);
        formData.append('autor', document.getElementById('autor').value);
        formData.append('usuarioId', document.getElementById('seleccion-usuario').value || '');

        if (imagen) {
            formData.append('imagen', imagen);
        }

        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${LIBROS_URL}/${id}` : LIBROS_URL;

        try {
            const respuesta = await fetch(url, {
                method: metodo,
                body: formData
            });
            const cuerpo = await leerRespuesta(respuesta);

            if (respuesta.status === 200 || respuesta.status === 201) {
                mostrarMensaje(cuerpo.mensaje, 'success');
                limpiarlibroFormulario();
                cargarLibros();
            } else if (respuesta.status === 400) {
                mostrarMensaje(mensajeErrorPorStatus(400, cuerpo), 'error');
            } else if (respuesta.status === 404) {
                mostrarMensaje(mensajeErrorPorStatus(404, cuerpo), 'warning');
            }
        } catch (error) {
            console.error(error);
            mostrarMensaje('No se pudo conectar con el servidor', 'error');
        }
    });
}

async function eliminarLibro(id) {
    if (!confirm('Seguro de eliminar este libro?')) return;

    try {
        const respuesta = await fetch(`${LIBROS_URL}/${id}`, { method: 'DELETE' });
        const cuerpo = await leerRespuesta(respuesta);

        if (respuesta.status === 200) {
            mostrarMensaje(cuerpo.mensaje, 'success');
            cargarLibros();
        } else if (respuesta.status === 404) {
            mostrarMensaje(mensajeErrorPorStatus(404, cuerpo), 'warning');
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje('No se pudo conectar con el servidor', 'error');
    }
}

if (document.getElementById('cuerpo-tabla-usuarios')) cargarUsuarios();
if (document.getElementById('tablas-libro')) cargarLibros();
if (document.getElementById('seleccion-usuario')) actualizarSeleccionUsuarios();
if (document.getElementById('libro-formulario')) prepararEdicionLibro();
if (document.getElementById('usuario-formulario')) prepararEdicion();
