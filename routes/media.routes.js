const express = require('express')

const router = express.Router()
const mediaController = require('../controller/mediaController')

router.post('/', mediaController.uploadMeidaFile)


module.exports = router