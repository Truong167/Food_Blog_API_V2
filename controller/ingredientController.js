
const { INGREDIENT_NOT_FOUND, SUCCES_SEARCH } = require('../contants/error-code/ingredient')
const { SUCCESS_GET_DATA } = require('../contants/error-code/user')
const db = require('../models/index')
const sequelize = require('sequelize')

const { Op } = sequelize


class ingredientController {

    handleGetAllIngredient = async (req, res) => {
        try {
            let ingredient = await db.Ingredient.findAll()
            if(ingredient && ingredient.length > 0) {
                ingredient = ingredient.map(item => {
                    item.dataValues.id = item.dataValues.ingredientId
                    delete item.dataValues['ingredientId']
                    return item
                })
                res.status(200).json({
                    success: true, 
                    message: SUCCESS_GET_DATA, 
                    data: ingredient
                })
                return
            }
            res.status(400).json({
                success: false, 
                message: INGREDIENT_NOT_FOUND,
                data: ""
            })
        } catch (error) {
            res.status(500).json({
                success: false, 
                message: error.message,
                data: ""
            })
        }
    }
    
    handleSearchIngredient = async (req, res) => {

        // http://localhost:8080/api/v1/ingredient/search?q=mì
        // 
        try {
            let { q } = req.query
            let ingredient = await db.Ingredient.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${q}%`
                    }
                }
            })
            
            if(ingredient && ingredient.length > 0) {
                res.status(200).json({
                    success: true, 
                    message: SUCCES_SEARCH, 
                    data: ingredient
                })
                return
            }
            res.status(400).json({
                success: false, 
                message: INGREDIENT_NOT_FOUND,
                data: ""
            })
            
        } catch (error) {
            res.status(500).json({
                success: false, 
                message: error.message,
                data: ""
            })
        }
    }

    getIngredientBySeason = async (req, res) => {
        try {
            let date = new Date()
            let month = date.getMonth() + 1
            let ingredient = await db.Ingredient.findAll({
                include: [{
                    model: db.IngredientSeason,
                    attributes: [],
                    include: [{
                        model: db.Season,
                        attributes: [],
                        include: [{
                            model: db.Month,
                            where: {
                                monthId: month,
                            },
                            attributes: []
                        }],
                        required: true
                    }],
                    required: true
                }]
            })
            if(ingredient && ingredient.length > 0){
                res.status(200).json({
                    success: true, 
                    message: SUCCESS_GET_DATA,
                    data: ingredient
                })
                return
            }
            res.status(427).json({
                success: false, 
                message: INGREDIENT_NOT_FOUND,
                data: ""
            })
        } catch (error) {
            res.status(500).json({
                success: false, 
                message: error.message,
                data: ""
            })
        }
    }

}

module.exports = new ingredientController