const multer = require('multer');
const path = require('path')

//setting storage
function createMulter(foldername) {
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join('uploads', foldername));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

return multer({storage})
}


// const upload = multer({storage})//if limits limit: {filesize: 2 * 1024 * 1024}2mb max
module.exports = createMulter;
