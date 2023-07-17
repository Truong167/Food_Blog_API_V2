
const db = require('../models/index')

class favoriteController {
    index = (req, res) => {
        res.send('favorite')
    }

    handleCreateFavorite = async (req, res) => {
        try {
            let { recipeId } = req.params
            let userId = req.userId
            let recipe = await db.Recipe.findByPk(recipeId)
            let checkFavorite = await db.Favorite.findOne({where: {
                userId: userId,
                recipeId: recipeId,
            }})
            console.log(checkFavorite)
            if(recipe && !checkFavorite) {
                let favorite = await db.Favorite.create({
                    userId: userId,
                    recipeId: recipeId,
                    date: Date.now()
                })
                let count = await db.Favorite.count({
                    where: {
                        recipeId: recipeId
                    }
                })
                recipe.numberOfLikes = count
                await recipe.save()
                res.status(200).json({
                    success: true, 
                    message: 'Successfully',
                    data: favorite
                })
            } else if(!recipe) {
                res.status(432).json({
                    success: false, 
                    message: 'Recipe not found',
                    data: ""
                })
            } else {
                res.status(444).json({
                    success: false, 
                    message: 'User liked this recipe',
                    data: ""
                })
            }
        } catch (error) {
            res.status(500).json({
                success: false, 
                message: error,
                data: ""
            })
        }
    }

    handleDeleteFavorite = async (req, res) => {
        try {
            let { recipeId } = req.params
            let userId = req.userId
            let favorite = await db.Favorite.findOne({where: {userId: userId, recipeId: recipeId}})
            let recipe = await db.Recipe.findByPk(recipeId)
            if(favorite) {
                await favorite.destroy()
                res.status(200).json({
                    success: true, 
                    message: 'Successfully',
                    data: "",
                })
                let count = await db.Favorite.count({
                    where: {
                        recipeId: recipeId
                    }
                })
                recipe.numberOfLikes = count
                await recipe.save()
            } else if(!recipe) {
                res.status(432).json({
                    success: false, 
                    message: 'Recipe not found',
                    data: ""
                })
            } else {
                res.status(445).json({
                    success: false, 
                    message: 'User has unliked this recipe',
                    data: ""
                })
            }
        } catch (error) {
            res.status(500).json({
                success: false, 
                message: error.message,
                data: ""
            })
        }
    }

}


module.exports = new favoriteController