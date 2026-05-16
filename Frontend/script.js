const API_URL = 'http://localhost:3000/api/usuarios';
const LIBROS_URL = 'http://localhost:3000/api/libros';
const PAGINA_404 = 'error404.html';

function redirigir404() {
    window.location.href = PAGINA_404;
}

function redirigir201() {
    window.location.href = 'index.html';
}

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

function mensajeDetallesValidacion(detalles) {
    if (!detalles || typeof detalles !== 'object') return '';
    return Object.values(detalles).filter(Boolean).join(' ');
}

function validarTextoObligatorio(valor, campo, nombreLegible) {
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

function validarTextoOpcional(valor, campo, nombreLegible) {
    if (valor === undefined || valor === null || valor === '') {
        return null;
    }

    if (typeof valor !== 'string') {
        return `El campo ${nombreLegible} debe ser texto`;
    }

    return null;
}

function validarFormatoObligatorio(valor, campo, nombreLegible, expresion, formatoAceptado) {
    const errorTexto = validarTextoObligatorio(valor, campo, nombreLegible);
    if (errorTexto) return errorTexto;

    if (!expresion.test(valor.trim())) {
        return `El campo ${nombreLegible} debe tener el formato: ${formatoAceptado}`;
    }

    return null;
}

function validarFormatoOpcional(valor, campo, nombreLegible, expresion, formatoAceptado) {
    const errorTexto = validarTextoOpcional(valor, campo, nombreLegible);
    if (errorTexto) return errorTexto;

    if (valor === undefined || valor === null || valor.trim() === '') {
        return null;
    }

    if (!expresion.test(valor.trim())) {
        return `El campo ${nombreLegible} debe tener el formato: ${formatoAceptado}`;
    }

    return null;
}

function validarCamposFormulario(campos) {
    const errores = {};

    campos.forEach(({ id, campo, nombre, obligatorio, expresion, formato }) => {
        const input = document.getElementById(id);
        const valor = input?.value;
        const error = expresion
            ? (obligatorio
                ? validarFormatoObligatorio(valor, campo, nombre, expresion, formato)
                : validarFormatoOpcional(valor, campo, nombre, expresion, formato))
            : (obligatorio
                ? validarTextoObligatorio(valor, campo, nombre)
                : validarTextoOpcional(valor, campo, nombre));

        if (error) errores[campo] = error;
    });

    return errores;
}

function validarUsuarioFormulario() {
    return validarCamposFormulario([
        { id: 'nombre', campo: 'nombre', nombre: 'nombre', obligatorio: true },
        { id: 'apellido', campo: 'apellido', nombre: 'apellido', obligatorio: true },
        { id: 'dni', campo: 'dni', nombre: 'dni', obligatorio: true, expresion: /^[0-9]{8}[A-Z]$/, formato: '8 numeros y 1 letra mayuscula. Ejemplo: 12345678X' },
        { id: 'email', campo: 'email', nombre: 'email', obligatorio: true, expresion: /^[^\s@]+@[^\s@]+$/, formato: 'texto@texto' },
        { id: 'telefono', campo: 'telefono', nombre: 'telefono', obligatorio: false, expresion: /^[0-9]{9}$/, formato: '9 numeros. Ejemplo: 600123456' }
    ]);
}

function validarLibroFormulario() {
    return validarCamposFormulario([
        { id: 'titulo', campo: 'titulo', nombre: 'titulo', obligatorio: true },
        { id: 'autor', campo: 'autor', nombre: 'autor', obligatorio: true }
    ]);
}

function hayErroresValidacion(errores) {
    return Object.keys(errores).length > 0;
}

function manejarError(error) {
    console.error(error);

    if (error.status === 400) {
        const detalles = mensajeDetallesValidacion(error.detalles);
        mostrarMensaje(detalles || error.message, 'error');
        return;
    }

    if (error.status === 404) {
        redirigir404();
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
                <td class="columna">${textoSeguro(usuario.apellido)}</td>
                <td class="columna">${textoSeguro(usuario.dni)}</td>
                <td class="columna">${textoSeguro(usuario.email)}</td>
                <td class="columna">${textoSeguro(usuario.telefono)}</td>
                <td class="columna-boton">
                    <button class="boton boton-editar" onclick="window.location.href='usuarios.html?id=${usuario.id}'">${trad('editar')}</button>
                    <button class="boton boton-borrar" onclick="eliminar(${usuario.id})">${trad('eliminar')}</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        manejarError(error);
        tabla.innerHTML = `
            <tr>
                <td class="columna" colspan="6">${trad('errorUsuarios')}</td>
            </tr>
        `;
    }
}

async function prepararEdicion(id) {
    if (!id) {
        const params = new URLSearchParams(window.location.search);
        id = params.get('id');
    }

    if (!id) return;

    try {
        const cuerpo = await fetch(API_URL).then(procesarRespuesta);
        const usuarios = obtenerDatos(cuerpo);
        const usuario = usuarios.find(usuario => String(usuario.id) === String(id));

        if (!usuario) {
            redirigir404();
            return;
        }

        document.getElementById('usuario-id').value = usuario.id;
        document.getElementById('nombre').value = usuario.nombre;
        document.getElementById('apellido').value = usuario.apellido || '';
        document.getElementById('dni').value = usuario.dni || '';
        document.getElementById('email').value = usuario.email || '';
        document.getElementById('telefono').value = usuario.telefono || '';
        document.getElementById('titulo-formulario').innerText = trad('editarUsuario');
        document.getElementById('boton-enviar').innerText = trad('actualizar');
    } catch (error) {
        manejarError(error);
    }
}

function limpiarformulario() {
    document.getElementById('usuario-id').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('apellido').value = '';
    document.getElementById('dni').value = '';
    document.getElementById('email').value = '';
    document.getElementById('telefono').value = '';
    window.location.href = 'usuarios-list.html'
}

const usuarioFormulario = document.getElementById('usuario-formulario');
if (usuarioFormulario) {
    usuarioFormulario.setAttribute('novalidate', 'novalidate');

    usuarioFormulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        limpiarMensaje();

        const id = document.getElementById('usuario-id').value;
        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const dni = document.getElementById('dni').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;
        const errores = validarUsuarioFormulario();

        if (hayErroresValidacion(errores)) {
            mostrarMensaje(mensajeDetallesValidacion(errores), 'error');
            return;
        }

        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        try {
            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: nombre.trim(),
                    apellido: apellido.trim(),
                    dni: dni.trim(),
                    email: email.trim(),
                    telefono: telefono.trim()
                })
            });
            const cuerpo = await procesarRespuesta(respuesta);

            if (respuesta.status === 201) {
                redirigir201();
                return;
            }

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

async function prepararEdicionLibro(id, titulo, autor, usuarioId) {
    if (!id) {
        const params = new URLSearchParams(window.location.search);
        id = params.get('id');
        titulo = params.get('titulo');
        autor = params.get('autor');
        usuarioId = params.get('usuarioId');
    }

    if (!id) {
        await actualizarSeleccionUsuarios();
        return;
    }

    try {
        const cuerpo = await fetch(LIBROS_URL).then(procesarRespuesta);
        const libros = obtenerDatos(cuerpo);
        const libro = libros.find(libro => String(libro.id) === String(id));

        if (!libro) {
            redirigir404();
            return;
        }

        await actualizarSeleccionUsuarios();

        document.getElementById('libro-id').value = libro.id;
        document.getElementById('titulo').value = libro.titulo || titulo;
        document.getElementById('autor').value = libro.autor || autor;
        document.getElementById('seleccion-usuario').value = libro.usuarioId || usuarioId || '';
        document.getElementById('libro-titulo-formulario').innerText = trad('editarLibro');
        document.getElementById('boton-libro-enviar').innerText = trad('actualizarLibro');
    } catch (error) {
        manejarError(error);
    }
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
    libroFormulario.setAttribute('novalidate', 'novalidate');

    libroFormulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        limpiarMensaje();

        const id = document.getElementById('libro-id').value;
        const datos = new FormData();
        const imagen = document.getElementById('imagen').files[0];
        const errores = validarLibroFormulario();

        if (hayErroresValidacion(errores)) {
            mostrarMensaje(mensajeDetallesValidacion(errores), 'error');
            return;
        }

        datos.append('titulo', document.getElementById('titulo').value.trim());
        datos.append('autor', document.getElementById('autor').value.trim());
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

            if (respuesta.status === 201) {
                redirigir201();
                return;
            }

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
if (document.getElementById('seleccion-usuario') && !document.getElementById('libro-formulario')) actualizarSeleccionUsuarios();
if (document.getElementById('libro-formulario')) prepararEdicionLibro();
if (document.getElementById('usuario-formulario')) prepararEdicion();
