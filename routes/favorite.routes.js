const express = require('express')

const router = express.Router()
const favoriteController = require('../controller/favoriteController')


// http://localhost:8080/api/v1/favorite/

router.get('/', favoriteController.index)
router.post('/create/:recipeId', favoriteController.handleCreateFavorite)
router.delete('/delete/:recipeId', favoriteController.handleDeleteFavorite)



module.exports = router