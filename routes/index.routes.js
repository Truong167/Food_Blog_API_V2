const express = require('express')
const userRouter = require('./user.routes')
const recipeRouter = require('./recipe.routes')
const recipeListRouter = require('./recipeList.routes')
const ingredientRouter = require('./ingredient.routes')
const commentRouter = require('./comment.routes')
const favoriteRouter = require('./favorite.routes')
const followRouter = require('./follow.routes')
const authRouter = require('./auth.routes')
const stepRouter = require('./step.routes')
const adminRouter = require('./admin.routes')
const verifyToken = require('../middlewares/auth')




// http://localhost:8080/api/v1/


function routes(app){
    // app.use('/api/v1', )
    app.use('/api/v1/user',verifyToken, userRouter)
    app.use('/api/v1/recipe',verifyToken, recipeRouter)
    app.use('/api/v1/recipeList',verifyToken, recipeListRouter)
    app.use('/api/v1/ingredient', verifyToken, ingredientRouter)
    app.use('/api/v1/comment',verifyToken, commentRouter)
    app.use('/api/v1/favorite',verifyToken, favoriteRouter)
    app.use('/api/v1/follow',verifyToken, followRouter)
    app.use('/api/v1/auth', authRouter)
    app.use('/api/v1/admin', adminRouter)

    
    // app.use('/api/v1/user', userRouter)
    // app.use('/api/v1/recipe', recipeRouter)
    // app.use('/api/v1/recipeList', recipeListRouter)
    // app.use('/api/v1/ingredient', ingredientRouter)
    // app.use('/api/v1/comment', commentRouter)
    // app.use('/api/v1/favorite', favoriteRouter)
    // app.use('/api/v1/follow', followRouter)
    app.use('/api/v1/step', stepRouter)
    // app.use('/api/v1/auth', authRouter)
    app.use('/', (req, res) => {res.send({ message: 'Đây là Food Blog Web Services' })});
}

module.exports = routes