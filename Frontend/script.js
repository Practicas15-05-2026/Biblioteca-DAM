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

    try {
        const usuarios = await fetch(API_URL).then(procesarRespuesta);

        tabla.innerHTML = usuarios.map(usuario => `
            <tr>
                <td class="columna">${usuario.nombre}</td>
                <td class="columna-boton">
                    <button class="boton boton-editar" onclick="window.location.href='usuarios.html?id=${usuario.id}&nombre=${encodeURIComponent(usuario.nombre)}'">Editar</button>
                    <button class="boton boton-borrar" onclick="eliminar(${usuario.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        tabla.innerHTML = `
            <tr>
                <td class="columna" colspan="2">No se pudieron cargar los usuarios</td>
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
    usuarioFormulario.addEventListener('submit', async (e) => {
        e.preventDefault();
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

            if (respuesta.status === 201 || respuesta.status === 200) {
                limpiarformulario();
                cargarUsuarios();
                actualizarSeleccionUsuarios();
            } else if (respuesta.status === 400) {
                alert("Error 400: Datos inválidos");
            } else if (respuesta.status === 404) {
                alert("Error 404: Usuario no encontrado");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
}

async function eliminar(id) {
    if (confirm('¿Seguro?')) {
        const respuesta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (respuesta.status === 200) {
            cargarUsuarios();
            actualizarSeleccionUsuarios();
        } else if (respuesta.status === 404) {
            alert("Error 404: No encontrado");
        }
    }
}

async function cargarLibros() {
    try {
        const respuesta = await fetch(LIBROS_URL);
        if (respuesta.status === 200) {
            const libros = await procesarRespuesta(respuesta);
            const tabla = document.getElementById('tablas-libro');
            if (tabla) {
                tabla.innerHTML = '';
                libros.forEach(lib => {
                    tabla.innerHTML += `
                    <tr class="block">
                        <td class="columna titulo">Titulo : <span>${lib.titulo}</span></td>
                        <td class="columna">Autor : ${lib.autor}</td>
                        <td class="columna">Dueño : ${lib.dueno || 'Sin asignar'}</td>
                        <div class="columna-boton">
                            <button class="boton boton-editar " 
                                onclick="window.location.href='registrar-libros.html?id=${lib.id}&titulo=${lib.titulo}&autor=${lib.autor}&usuarioId=${lib.usuarioId}'">
                                Editar
                            </button>
                            <button class="boton boton-borrar " onclick="eliminarLibro(${lib.id})">Eliminar</button>
                        </div>
                    </tr>`;
                });
            }
        }
    } catch (error) {
        console.error("Error al cargar libros:", error);
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
    document.getElementById('seleccion-usuario').value = usuarioId || "";

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
    try {
        const usuarios = await fetch(API_URL).then(procesarRespuesta);
        const seleccion = document.getElementById('seleccion-usuario');
        if (!seleccion) return;

        seleccion.innerHTML = '<option value="">Sin dueño</option>';
        usuarios.forEach(usuario => {
            seleccion.innerHTML += `<option value="${usuario.id}">${usuario.nombre}</option>`;
        });
    } catch (error) {
        console.error("Error al actualizar seleccion:", error);
    }
}

const libroFormulario = document.getElementById('libro-formulario');
if (libroFormulario) {
    libroFormulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const id = document.getElementById('libro-id').value;
        const datos = {
            titulo: document.getElementById('titulo').value,
            autor: document.getElementById('autor').value,
            usuarioId: document.getElementById('seleccion-usuario').value || null
        };

        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${LIBROS_URL}/${id}` : LIBROS_URL;

        try {
            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (respuesta.status === 201 || respuesta.status === 200) {
                limpiarlibroFormulario();
                cargarLibros();
            } else if (respuesta.status === 400) {
                alert("Error 400: Datos del libro incompletos");
            } else if (respuesta.status === 404) {
                alert("Error 404: Libro no encontrado");
            }
        } catch (error) {
            console.error("Error en libros:", error);
        }
    });
}

async function eliminarLibro(id) {
    if (confirm('¿Estás seguro de eliminar este libro?')) {
        const respuesta = await fetch(`${LIBROS_URL}/${id}`, { method: 'DELETE' });
        if (respuesta.status === 200) {
            cargarLibros();
        } else if (respuesta.status === 404) {
            alert("Error 404: Libro no encontrado");
        }
    }
}

if (document.getElementById('cuerpo-tabla-usuarios')) cargarUsuarios();
if (document.getElementById('tablas-libro')) cargarLibros();
if (document.getElementById('seleccion-usuario')) actualizarSeleccionUsuarios();
if (document.getElementById('libro-formulario')) prepararEdicionLibro();
if (document.getElementById('usuario-formulario')) prepararEdicion();
