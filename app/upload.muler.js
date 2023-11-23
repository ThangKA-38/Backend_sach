var appRoot = require('app-root-path')
const multer = require('multer')
const path = require('path')

const storages = multer.diskStorage({
    destination: function(req, file, cb) {
        // console.log(appRoot)
        cb(null, appRoot + "/public/upload");
    },
    filename: function(req, file, cb) {
        const originalname = path.parse(file.originalname).name; // Extract the original filename without extension
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const newFilename = `${originalname}_${timestamp}${ext}`;
        cb(null, newFilename);
    }
});
let upload = multer({ storage: storages });

module.exports = upload