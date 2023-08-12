const express = require('express')

const router = express.Router()
const recipeController = require('../controller/recipeController')


// http://localhost:8080/api/v1/recipe

router.get('/getAllRecipe', recipeController.getRecipe)
router.get('/getRecipe/:id', recipeController.getDetailRecipe)
router.get('/search', recipeController.handleSearchRecipe)
router.get('/searchRecipe', recipeController.searchRecipe)
router.get('/getRecipeByIngredient/:slug', recipeController.getRecipeByIngredient)
router.get('/getPopularRecipe', recipeController.getPopularRecipe)
router.get('/getRecipeFromFollowers', recipeController.getRecipeFromFollowers)
router.get('/getRecipeByName/:slug', recipeController.handleGetRecipeByName)
router.get('/getMyRecipe', recipeController.getMyRecipe)
router.get('/getRecipeByUserId/:userId', recipeController.getRecipeByUserId)
router.get('/getRecipeFavorite', recipeController.getRecipeFavorite)



router.post('/createRecipe', recipeController.handleCreateRecipe)

router.put('/updateRecipe/:id', recipeController.handleUpdateRecpipe)
router.put('/updatePrivacyRecipe/:id', recipeController.updatePrivacyOfRecipe)
router.delete('/deleteRecipe/:id', recipeController.handleDeleteRecipe)




module.exports = router