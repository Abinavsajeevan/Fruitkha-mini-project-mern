const multer = require('multer');
const path = require('path')

//setting storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});



const upload = multer({storage})//if limits limit: {filesize: 2 * 1024 * 1024}2mb max
module.exports = upload;
