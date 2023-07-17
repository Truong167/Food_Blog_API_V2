const bcrypt = require('bcryptjs')
const db = require('../models/index')
const {sequelize} = require('../models/index')
const Sequelize = require('sequelize')
const { Op } = Sequelize
let multerConfig = require("../middlewares/utils/multerConfig")
const {
    validatePassword,
} = require('../middlewares/validator')
const {formatDate1, formatDate2} = require('../middlewares/utils/formatDate')
require('dotenv').config()

class adminController {
    
    handleLoginAdmin = async (req, res) => {
        const { accountName, password } = req.body
        if(!accountName || !password) {
            res.status(418).json({
                success: false,
                message: 'Please all provide required fields',
                data: ""
            })
            return
        }
        try {
            let account = await db.Admin.findByPk(accountName)
            if(!account)
            return res.status(424).json({
                success: false,
                message: 'Account does not exist',
                data: ""
            })
            const pass = await bcrypt.compare(password, account.password)
            if(!pass)
            return  res.status(425).json({
                success: false,
                message: 'Password do not match',
                data: ""
            })
            res.status(200).json({
                success: true,
                message: 'Successfully logged in',
                data: ''
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
                data: ""
            })
        }
    }

    statisticalOfIngredient2 = async (req, res) => {
        try {
            let ingredient = await db.DetailIngredient.findAll({
                include: {
                    model: db.Ingredient,
                    attributes: ["name", "image", "createdAt"]
                },
                attributes: [
                    "ingredientId",
                    [sequelize.fn('COUNT', sequelize.col('DetailIngredient.ingredientId')), 'recipeUsed']
                ],
                group: ['Ingredient.ingredientId', 'DetailIngredient.ingredientId']
            })

            if(ingredient && ingredient.length > 0){
                ingredient.map(item => {
                    item.dataValues.name = item.dataValues.Ingredient.dataValues.name
                    item.dataValues.image = item.dataValues.Ingredient.dataValues.image
                    item.dataValues.createdAt = formatDate1(item.dataValues.Ingredient.dataValues.createdAt)
                    delete item.dataValues['Ingredient']
                    return item
                })
    
                return res.status(200).json({
                    success: true, 
                    message: 'Successfully get data',
                    data: ingredient
                })
            }

            res.status(452).json({
                success: true, 
                message: 'Do not have statistical',
                data: ingredient
            })
            
        } catch (error) {
            res.status(500).json({
                success: false, 
                message: error.message,
                data: ""
            })
        }
    }

    statisticalOfIngredient = async (req, res) => {
        try {
            let ingredient = await db.Ingredient.findAll({
                include: {
                    model: db.DetailIngredient,
                    attributes: [],
                },
                attributes: [
                    "ingredientId", "name", "image", "createdAt",
                    [sequelize.fn('COUNT', sequelize.col('DetailIngredients.ingredientId')), 'recipeUsed']
                ],
                group: ['DetailIngredients.ingredientId', 'Ingredient.ingredientId']
            })

            if(ingredient && ingredient.length > 0){
                ingredient.map(item => {
                    item.dataValues.createdAt = formatDate1(item.dataValues.createdAt)
                    return item
                })
    
                return res.status(200).json({
                    success: true, 
                    message: 'Successfully get data',
                    data: ingredient
                })
            }

            res.status(452).json({
                success: true, 
                message: 'Do not have statistical',
                data: ingredient
            })
            
        } catch (error) {
            res.status(500).json({
                success: false, 
                message: error.message,
                data: ""
            })
        }
    }

    createIngredient = async (req, res) => {
        let uploadFile = multerConfig().fields(
            [
                {
                    name: 'ingredient',
                    maxCount: 1
                },
            ]
        )
        uploadFile( req, res, async (error) => {
            let { ingredientId, name, season } = req.body
            let seasonObj = []
            if(error) {
                return res.status(440).json({
                    success: false, 
                    message: `Error when trying to upload: ${error.message}`,
                    data: ""
                });
            } 
            if(!ingredientId || !name){
                res.status(418).json({
                    status: false,
                    message: 'Please provide all required fields',
                    data: ""
                })
                return
            }
            // if(season.length == 0){
            //     for(let i = 1; i < 5; i++){
            //         seasonObj.push({ingredientId, seasonId: i})
            //     }
            // } else {
            //     seasonObj =  season.map(item => {
            //         item.ingredientId = ingredientId
            //         return item
            //     })
            // }
            season = JSON.parse(season)
            season.map(item => {
                item.ingredientId = ingredientId
                return item
            })

            try {
                const result = await sequelize.transaction(async t => {
                    let ingredient = await db.Ingredient.create({
                        ingredientId: ingredientId,
                        name: name,
                        image: req.files.ingredient ? `/ingredient/${req.files.ingredient[0].filename}` : null
                    }, { transaction: t })
                    let ingredientSeason = await db.IngredientSeason.bulkCreate(season, { transaction: t })
                    return {ingredient, ingredientSeason}
                })
                res.status(200).json({
                    success: true, 
                    message: 'Successfully added',
                    data: result
                })
            } catch (error) {
                res.status(500).json({
                    success: false, 
                    message: error.message, 
                    data: ""
                })
            }
        })
    }

    updateIngredient = async (req, res) => {
        let uploadFile = multerConfig().fields(
            [
                {
                    name: 'ingredient',
                    maxCount: 1
                },
            ]
        )
        uploadFile( req, res, async (error) => {
            // let season = [{seasonId: 1}]
            let { season, name } = req.body
            let {ingredientId} = req.params
            season = JSON.parse(season)
            if(error) {
                return res.status(440).json({
                    success: false, 
                    message: `Error when trying to upload: ${error.message}`,
                    data: ""
                });
            } 
            if(!ingredientId || !name){
                res.status(418).json({
                    status: false,
                    message: 'Please provide all required fields: data',
                    data: ""
                })
                return
            }
            try {
                let seasonList = await db.IngredientSeason.findAll({where: {ingredientId: ingredientId}})
                // lọc các phần tử trong seasonList không trùng với các phần tử trong season
                seasonList = seasonList.filter(({seasonId: id1}) => !season.some(({seasonId: id2}) => id1 === id2))
                seasonList = seasonList.map(item => (item.dataValues.seasonId))
                season.map(item => {
                    item.ingredientId = ingredientId
                    return item
                })
                console.log(req.body)
                let ingredient = await db.Ingredient.findByPk(ingredientId)
                if(ingredient){
                    const updateIngredient = await sequelize.transaction(async t => {
                        if(seasonList.length > 0) {
                            await db.IngredientSeason.destroy({
                                where: {
                                    [Op.and]: [
                                        {
                                            seasonId: {
                                                [Op.or]: seasonList
                                            }
                                        },
                                        {
                                            ingredientId: ingredientId
                                        }
                                    ]
                                    
                                },
                            }, {transaction: t})
                            await db.IngredientSeason.bulkCreate(season, {
                                updateOnDuplicate: ["seasonId", "ingredientId"],
                            } ,{transaction: t})
                        } else {
                            await db.IngredientSeason.bulkCreate(season, {
                                updateOnDuplicate: ["seasonId", "ingredientId"],
                            } ,{transaction: t})
                        }
                        ingredient.name = name
                        ingredient.image =  req.files.ingredient ? `/ingredient/${req.files.ingredient[0].filename}` : ingredient.image
                        await ingredient.save({transaction: t})
                    })
                    return res.status(200).json({
                        success: true, 
                        message: 'Successfully update',
                        data: ingredient
                    })
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
        })
    }

    deleteIngredient = async (req, res) => {
        let { ingredientId } = req.params
        try {
            let ingredient = await db.Ingredient.findByPk(ingredientId)
            if(!ingredient){
                return res.status(427).json({
                    success: false, 
                    message: 'Ingredient not found',
                    data: ""
                })
            }
            let dtIngredient = await db.DetailIngredient.findAll({
                where: {
                    ingredientId: ingredientId
                }
            })
            if(dtIngredient && dtIngredient.length > 0){
                return res.status(453).json({
                    success: false,
                    message: 'Unable to delete ingredient that already exist in some recipes',
                    data: ''
                })
            }
            await sequelize.transaction(async t => {
                await db.IngredientSeason.destroy({where: {ingredientId: ingredientId}}, { transaction: t })
                await db.Ingredient.destroy({where: {ingredientId: ingredientId}}, { transaction: t })
            })

            res.status(200).json({
                success: true, 
                message: 'Successfully delete',
                data: ''
            })
        } catch (error) {
            res.status(500).json({
                success: false, 
                message: error.message, 
                data: ""
            })
        }
    }

    getIngredient = async (req, res) => {
        let { ingredientId } = req.params
        try {
            let ingredient = await db.Ingredient.findByPk(ingredientId, {
                include: {
                    model: db.IngredientSeason,
                    include: {
                        model: db.Season,
                        attributes: ['nameOfSeason']
                    },
                    attributes: ["seasonId"]
                }, 
                attributes: ['ingredientId', 'name', 'image', 'createdAt']
            })
            if(ingredient) {
                ingredient.dataValues.createdAt = formatDate1(ingredient.dataValues.createdAt)
                ingredient.dataValues.IngredientSeasons.map(item => {
                    item.dataValues.seasonName = item.dataValues.Season.nameOfSeason
                    delete item.dataValues['Season']
                })
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

    statisticalOfIngredient1 = async (req, res) => {
        let { ingredientId } = req.params
        try {
            let ingredient = await db.DetailIngredient.findAll({
                where: {
                    ingredientId: ingredientId
                },
                include: [
                    {
                    model: db.Ingredient,
                    attributes: ["name", "image", "createdAt"],
                    },
                ],
                attributes: [
                    "ingredientId",
                    [sequelize.fn('COUNT', sequelize.col('DetailIngredient.ingredientId')), 'recipeUsed']
                ],
                group: ['Ingredient.ingredientId', 'DetailIngredient.ingredientId']
            })

            let useStatiscal = await db.DetailIngredient.findAll({
                where: {
                    ingredientId: ingredientId
                },
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('DetailIngredient.ingredientId')), 'use'],
                    [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'time']
                ],
                group: ['DetailIngredient.ingredientId', [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'use']]
            })

            let season = await db.IngredientSeason.findAll({
                where: {
                    ingredientId: ingredientId
                },
                include: {
                    model: db.Season,
                    attributes: ['nameOfSeason']
                },
                attributes: ['seasonId']
            })
            
            season.map(item => {
                item.dataValues.seasonName = item.dataValues.Season.nameOfSeason
                delete item.dataValues['Season']
                return item
            })
            
            if(ingredient && ingredient.length > 0){
                useStatiscal.map(item => {
                    item.dataValues.time = formatDate2(item.dataValues.time)
                    return item
                })
                ingredient.map(item => {
                        item.dataValues.name = item.dataValues.Ingredient.dataValues.name
                        item.dataValues.image = item.dataValues.Ingredient.dataValues.image
                        item.dataValues.createdAt = formatDate1(item.dataValues.Ingredient.dataValues.createdAt)
                        item.dataValues.useStatiscal = useStatiscal
                        item.dataValues.season = season
                        delete item.dataValues['Ingredient']
                        return item
                })
                return res.status(200).json({
                    success: true, 
                    message: 'Successfully get data',
                    data: ingredient[0]
                })
            }

            let ingredient1 = await db.Ingredient.findByPk(ingredientId, {
                attributes: ["ingredientId", "name", "image", "createdAt"]
            })
            ingredient1.dataValues.recipeUsed = 0
            ingredient1.dataValues.createdAt = formatDate1(ingredient1.dataValues.createdAt)
            ingredient1.dataValues.useStatiscal = []
            ingredient1.dataValues.season = season
            res.status(200).json({
                success: true, 
                message: 'Do not have statistical',
                data: ingredient1
            })
            
        } catch (error) {
            res.status(500).json({
                success: false, 
                message: error.message,
                data: ""
            })
        }
    }

    getInforAdmin = async (req, res) => {
        let {accountName} = req.params
        try {
            let infor = await db.Admin.findByPk(accountName, {
                attributes: ["accountName", "fullName", "phoneNumber"]
            })
            if(infor){
                return res.status(200).json({
                    success: true,
                    message: 'Successfully get data',
                    data: infor
                })
            }

            res.status(424).json({
                success: true,
                message: 'Account does not exist',
                data: ''
            })

        } catch (error) {
            res.status(500).json({
                success: true,
                message: error.message,
                data: ''
            })
        }
    }

    createAccount = async (req, res) => {
        let {accountName, fullName, phoneNumber, password, password2} = req.body
        try {
            let checkExist = await db.Admin.findByPk(accountName)
            let checkPhone = await db.Admin.findAll({
                where: {
                    phoneNumber: phoneNumber
                }
            })
            if(checkExist){
                return res.status(423).json({
                    success: false,
                    message: 'Account already exists',
                    data: ""
                })
            }
            if(!fullName || !phoneNumber || !accountName || !password || !password2){
                res.status(418).json({
                    success: false,
                    message: 'Please provide all required fields',
                    data: ""
                })
            } else if(checkPhone && checkPhone.length > 0){
                res.status(454).json({
                    success: false,
                    message: 'Phone number already exists',
                    data: ""
                })
            } else if( password != password2){
                res.status(419).json({
                    success: false,
                    message: 'The entered passwords do not match',
                    data: ""
                })
            } else if(!validatePassword(password)){
                return res.status(420).json({
                    success: false,
                    message:
                      'Your password must be at least 6 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character.',
                    data: ""
                  })
            } else {
                await db.Admin.create({
                    accountName: accountName,
                    fullName: fullName,
                    password: bcrypt.hashSync(password, 10),
                    phoneNumber: phoneNumber
                })
    
                res.status(200).json({
                    success: true,
                    message: 'Successfully create account',
                    data: ''
                })
            }
        } catch (error) {
            res.status(500).json({
                success: true,
                message: error.message,
                data: ''
            })
        }

    }

}

module.exports = new adminController