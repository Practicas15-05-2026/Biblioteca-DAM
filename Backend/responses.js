


function ok(respuesta, data, mensaje = 'Operación realizada con éxito'){
    return respuesta.status(200).json({
        ok: true,
        mensaje, 
        data
    });
}

function created(respuesta, data, mensaje = 'Recurso creado con éxito'){
    return respuesta.status(201).json({
        ok: true,
        mensaje,
        data
    });
}

function badRequest(respuesta, data, mensaje = 'Data invalid'){
    return respuesta.status(400).json({
        ok: false,
        error : 'BAD_REQUEST',
        mensaje,
    })
}

function notFound(respuesta, mensaje = 'Recurso no encontrado') {
    return respuesta.status(404).json({
        ok: false,
        error: 'NOT_FOUND',
        mensaje
    });
}

module.exports = {
    ok, 
    created,
    badRequest,
    notFound
}