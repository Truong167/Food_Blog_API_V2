const multerConfig = require("../middlewares/utils/multerConfig")
const path = require('path')
const fs = require('fs')
const uploadCloud = require("../middlewares/utils/upload")
require('dotenv').config()

class mediaController {
    uploadMeidaFile = (req, res) => {
        let uploadFile = uploadCloud.single('file')
        uploadFile(req, res, error => {
            console.log(error)
            if(error) {
                return res.status(440).json({
                    success: false, 
                    message: `Error when trying to upload: ${error.message}`,
                    data: ""
                });
            }
            return res.status(200).json({
                success: true,
                data: req.file.path,
                message: ''
            })
        })
    }


}

module.exports = new mediaController