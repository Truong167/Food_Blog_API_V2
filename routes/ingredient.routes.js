const express = require('express')

const router = express.Router()
const ingredientController = require('../controller/ingredientController')


// http://localhost:8080/api/v1/ingredient


// router.delete('/deleteIngredient/:id', ingredientController.handleDeleteIngredient)
router.get('/search', ingredientController.handleSearchIngredient)
router.get('/getIngredientBySeason', ingredientController.getIngredientBySeason)







module.exports = router