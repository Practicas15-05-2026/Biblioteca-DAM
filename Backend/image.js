const multer = require('multer');
const path = require('path');

const almacenamiento = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const nombre = Date.now() + path.extname(file.originalname);
        cb(null, nombre);
    }
});

const subirImagen = multer({ storage: almacenamiento });

module.exports = subirImagen;
