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
router.get('/getRecipeByUserId', recipeController.getRecipeByUserId)
router.get('/getRecipeByUserId1/:userId', recipeController.getRecipeByUserId1)
router.get('/getRecipeFavorite', recipeController.getRecipeFavorite)



router.post('/createRecipe', recipeController.handleCreateRecipe)
router.post('/createRecipe1', recipeController.handleCreateRecipe1)

router.put('/updateRecipe/:id', recipeController.handleUpdateRecpipe)
router.put('/updateRecipe1/:id', recipeController.handleUpdateRecpipe1)
router.put('/updatePrivacyRecipe/:id', recipeController.updatePrivacyOfRecipe)
router.delete('/deleteRecipe/:id', recipeController.handleDeleteRecipe)




module.exports = router