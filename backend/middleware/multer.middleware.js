import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "../uploads")
    },
    filename: function (req, file, cb) {
        const suff=Date.now();
        cb(null, file.originalname+' - ' + suff)
    }
})

export const upload = multer({
    storage,
})