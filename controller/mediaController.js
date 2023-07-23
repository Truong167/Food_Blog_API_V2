const multerConfig = require("../middlewares/utils/multerConfig")
const path = require('path')
const fs = require('fs')
require('dotenv').config()

class mediaController {
    uploadMeidaFile = (req, res) => {
        let uploadFile = multerConfig().single('file')
        uploadFile(req, res, error => {
            if(error) {
                return res.status(440).json({
                    success: false, 
                    message: `Error when trying to upload: ${error.message}`,
                    data: ""
                });
            }
            return res.status(200).json({
                success: true,
                data: req.file.filename,
                message: ''
            })
        })
    }


    deleteMediaFile = (req, res) => {
        let { fileName } = req.params
        const directory = 'public/image'
        fs.unlink(path.join(directory, fileName),  function (err, data) {
            if (err)
                return res.status(404).json({
                    success: true,
                    data: '',
                    message: err
                })
            return res.status(200).json({
                success: true,
                data: '',
                message: ''
            })
        }); 
    }

}

module.exports = new mediaController