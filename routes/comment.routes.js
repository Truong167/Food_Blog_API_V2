const express = require('express')

const router = express.Router()
const commentController = require('../controller/commentController')


// http://localhost:8080/api/v1/comment/

router.get('/', commentController.index)
router.get('/getCommentOfRecipe/:recipeId', commentController.getCommentOfRecipe)

router.post('/createComment/:recipeId', commentController.handleCreateComment)
router.put('/updateComment/:recipeId', commentController.handleUpdateComment)
router.delete('/deleteComment/:recipeId', commentController.handleDeleteComment)


module.exports = router