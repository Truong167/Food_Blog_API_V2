const express = require('express')

const router = express.Router()
const mediaController = require('../controller/mediaController')


// http://localhost:8080/api/v1/ingredient


// router.delete('/deleteIngredient/:id', ingredientController.handleDeleteIngredient)
router.post('/', mediaController.uploadMeidaFile)
router.delete('/delete/:fileName', mediaController.deleteMediaFile)




module.exports = router