const API_URL = 'http://localhost:3000/api/usuarios';
const LIBROS_URL = 'http://localhost:3000/api/libros';

async function procesarRespuesta(respuesta) {
    const cuerpo = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(cuerpo.mensaje || 'Error en la peticion');
    }

    return cuerpo.data ?? cuerpo;
}

async function cargarUsuarios() {
    const tabla = document.getElementById('cuerpo-tabla-usuarios');
    if (!tabla) return;
    const datos = await fetch(API_URL).then(procesarRespuesta);
    tabla.innerHTML = datos.map(u => `
        <tr>
            <td>${u.nombre}</td>
            <td>
                <button class="boton boton-editar" onclick="prepararEdicion(${u.id}, '${u.nombre}')">Editar</button>
                <button class="boton boton-borrar" onclick="eliminar(${u.id})">Eliminar</button>
            </td>
        </tr>`).join('');
}

function prepararEdicion(id, nombre) {
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

async function eliminar(id) {
    if (confirm('¿Seguro?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        cargarUsuarios();
        actualizarSeleccionUsuarios();
    }
}

const usuarioFormulario = document.getElementById('usuario-formulario');
if (usuarioFormulario) {
    usuarioFormulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('usuario-id').value;
        const nombre = document.getElementById('nombre').value;
        await fetch(id ? `${API_URL}/${id}` : API_URL, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
        limpiarformulario();
        cargarUsuarios();
        actualizarSeleccionUsuarios();
    });
}

async function cargarLibros() {
    const tabla = document.getElementById('tablas-libro');
    if (!tabla) return;
    const libros = await fetch(LIBROS_URL).then(procesarRespuesta);
    tabla.innerHTML = libros.map(lib => `
        <tr>
            <td>${lib.titulo}</td>
            <td>${lib.autor}</td>
            <td>${lib.dueno || 'Sin asignar'}</td>
            <td>
                <button class="boton boton-editar" onclick="prepararEdicionLibro(${lib.id}, '${lib.titulo}', '${lib.autor}', ${lib.usuarioId})">Editar</button>
                <button class="boton boton-borrar" onclick="eliminarLibro(${lib.id})">Eliminar</button>
            </td>
        </tr>`).join('');
}

function prepararEdicionLibro(id, titulo, autor, usuarioId) {
    document.getElementById('libro-id').value = id;
    document.getElementById('titulo').value = titulo;
    document.getElementById('autor').value = autor;
    document.getElementById('seleccion-usuario').value = usuarioId || '';
    document.getElementById('libro-titulo-formulario').innerText = 'Editar Libro';
    document.getElementById('boton-libro-enviar').innerText = 'Actualizar Libro';
}

function limpiarlibroFormulario() {
    document.getElementById('libro-formulario').reset();
    document.getElementById('libro-id').value = '';
    document.getElementById('libro-titulo-formulario').innerText = 'Registrar Libro';
    document.getElementById('boton-libro-enviar').innerText = 'Guardar Libro';
}

async function actualizarSeleccionUsuarios() {
    const seleccion = document.getElementById('seleccion-usuario');
    if (!seleccion) return;
    const usuarios = await fetch(API_URL).then(procesarRespuesta);
    seleccion.innerHTML = '<option value="">Sin dueño</option>' +
        usuarios.map(u => `<option value="${u.id}">${u.nombre}</option>`).join('');
}

async function eliminarLibro(id) {
    if (confirm('¿Estás seguro?')) {
        await fetch(`${LIBROS_URL}/${id}`, { method: 'DELETE' });
        cargarLibros();
    }
}

const libroFormulario = document.getElementById('libro-formulario');
if (libroFormulario) {
    libroFormulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('libro-id').value;
        await fetch(id ? `${LIBROS_URL}/${id}` : LIBROS_URL, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                titulo: document.getElementById('titulo').value,
                autor: document.getElementById('autor').value,
                usuarioId: document.getElementById('seleccion-usuario').value || null
            })
        });
        limpiarlibroFormulario();
        cargarLibros();
    });
}

if (document.getElementById('cuerpo-tabla-usuarios')) cargarUsuarios();
if (document.getElementById('tablas-libro')) cargarLibros();
if (document.getElementById('seleccion-usuario')) actualizarSeleccionUsuarios();
