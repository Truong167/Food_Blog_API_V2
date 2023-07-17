
const db = require('../models/index')
const sequelize = require('sequelize')

const { Op } = sequelize


class ingredientController {
    
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
                    message: 'Successfully search', 
                    data: ingredient
                })
                return
            }
            res.status(400).json({
                success: false, 
                message: 'Ingredient not found',
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
                    message: 'Successfully get data',
                    data: ingredient
                })
                return
            }
            res.status(427).json({
                success: false, 
                message: 'Ingredient not found',
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