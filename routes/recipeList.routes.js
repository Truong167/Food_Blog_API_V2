const express = require('express')

const router = express.Router()
const recipeListController = require('../controller/recipeListController')


// http://localhost:8080/api/v1/recipeList




router.get("/getRecipeList", recipeListController.getRecipeList)
router.get("/getRecipe/:recipeListId", recipeListController.getRecipe)
router.get("/getBookmarkList/:recipeId", recipeListController.getBookmarkList)

router.post('/createRecipeList', recipeListController.handleCreateRecipeList)
router.post('/createRecipe/:recipeId', recipeListController.handleCreateRecipe)
router.put('/updateRecipeList/:id', recipeListController.handleUpdateRecipeList)
router.delete('/deleteRecipe/:recipeListId/:recipeId', recipeListController.handleDeleteRecipe)
router.delete('/deleteRecipeList/:id', recipeListController.handleDeleteRecipeList)


module.exports = router