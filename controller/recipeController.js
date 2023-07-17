
const db = require('../models')
const {sequelize} = require('../models/index')
const Sequelize = require('sequelize')
const { Op } = Sequelize
let multerConfig = require("../middlewares/utils/multerConfig")


class recipeController {
    getRecipe = async (req, res) => {
        try {
            const userId = req.userId
            // Select * from Recipe, User where Recipe.userId = User.userId
            let data = await db.Recipe.findAll({
                where: {
                    status: 'CK'
                },     
                include: [
                    {
                        model: db.User,
                        attributes: [
                            "fullName", "avatar", "userId",
                            [sequelize.literal(` (SELECT CASE WHEN EXISTS 
                                (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                                then True else False end isFollow) `), "isFollow"]
                        ]
                    },
                    {
                        model: db.DetailList,
                        include: {
                            model: db.RecipeList,
                            attributes: ["name"]
                        },
                        attributes: ["recipeListId"]
                    }, 
                ]
                ,
                attributes: [
                    "recipeId", "recipeName", "date", "numberOfLikes", "image", "status",
                    [sequelize.literal(`(SELECT CASE WHEN EXISTS 
                        (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
                        THEN True ELSE False end isFavorite) `), "isFavorite"]
                ],
                order: [["date", 'DESC']]
            })
            if(data && data.length > 0) {
                data.map(item => {
                    item.dataValues.DetailLists.map(item => {
                        item.dataValues.name = item.dataValues.RecipeList.dataValues.name
                        delete item.dataValues['RecipeList']
                        return item
                    })
                })
                return res.status(200).json({
                    success: true,
                    message: 'Successfully get data',
                    data: data
                })
            }
            res.status(429).json({
                success: false, 
                message: "Don't have recipe",
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

    handleCreateRecipe = async (req, res) => {
        let uploadFile = multerConfig().fields(
            [
                {
                    name: 'recipe',
                    maxCount: 1
                },
                {
                    name: 'step',
                    maxCount: 20
                }
            ]
        )
        uploadFile( req, res, async (error) => {
            let { data} = req.body
            if(error) {
                return res.status(440).json({
                    success: false, 
                    message: `Error when trying to upload: ${error.message}`,
                    data: ""
                });
            } 
            if(!data){
                res.status(418).json({
                            status: false,
                            message: 'Please provide all required fields: data',
                            data: ""
                        })
                        return
            }
            // if(!recipeName || !amount || !preparationTime || !cookingTime || !status || !DetailIngredients || !Steps) {

                // if(!amount) {
                //     res.status(418).json({
                //         status: false,
                //         message: 'Please provide all required fields: amount',
                //         data: ""
                //     })
                //     return
                // } else if(!recipeName){
                //     res.status(418).json({
                //         status: false,
                //         message: 'Please provide all required fields: recipeName',
                //         data: ""
                //     })
                //     return
                // }else if(!preparationTime){
                //     res.status(418).json({
                //         status: false,
                //         message: 'Please provide all required fields: preparationTime',
                //         data: ""
                //     })
                //     return
                // }else if(!status){
                //     res.status(418).json({
                //         status: false,
                //         message: 'Please provide all required fields: status',
                //         data: ""
                //     })
                //     return
                // }else if(!DetailIngredients){
                //     res.status(418).json({
                //         status: false,
                //         message: 'Please provide all required fields: DetailIngredients',
                //         data: ""
                //     })
                //     return
                // }else if(!Steps){
                //     res.status(418).json({
                //         status: false,
                //         message: 'Please provide all required fields: Steps',
                //         data: ""
                //     })
                //     return
                // }
                // else if(!cookingTime){
                //     res.status(418).json({
                //         status: false,
                //         message: 'Please provide all required fields: cookingTime',
                //         data: ""
                //     })
                //     return
                // }
                try {
                    data = JSON.parse(data)
                    let DetailIngredients = data.DetailIngredients
                    let Steps = data.Steps
                    let  userId = req.userId
                    const result = await sequelize.transaction(async t => {
                        let recipe = await db.Recipe.create({
                            recipeName: data.recipeName,
                            date: Date.now(),
                            amount: data.amount,
                            status: data.status,
                            preparationTime: data.preparationTime,
                            image: req.files.recipe ? `/recipe/${req.files.recipe[0].filename}` : null,
                            cookingTime: data.cookingTime,
                            description: data.description ? data.description : null,
                            video: data.video ? data.video : null,
                            userId: userId
                        }, { transaction: t })
                        DetailIngredients  = data.DetailIngredients.map(item => {
                            item.recipeId = recipe.recipeId
                            return item
                        })
                        let index = 0
                        for(let i = 0; i < data.Steps.length; i++){
                            if(Steps[i].image != "") {
                                Steps[i].image = `/step/${req.files.step[index].filename}`
                                index++
                            } else {
                                Steps[i].image = null
                            }
                            Steps[i].recipeId = recipe.recipeId
                        }
                        let ingre = await db.DetailIngredient.bulkCreate(DetailIngredients, { transaction: t })
                        let stepRes = await db.Step.bulkCreate(Steps, { transaction: t })
                        return {recipe, ingre, stepRes}
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

    handleCreateRecipe1 = async (req, res) => {
        let uploadFile = multerConfig().fields(
            [
                {
                    name: 'recipe',
                    maxCount: 1
                },
                {
                    name: 'step',
                    maxCount: 20
                }
            ]
        )
        uploadFile( req, res, async (error) => {
            console.log(req.body)
            let { recipeName, amount, status, preparationTime, cookingTime, description, DetailIngredients, Steps} = req.body
            if(error) {
                return res.status(440).json({
                    success: false, 
                    message: `Error when trying to upload: ${error.message}`,
                    data: ""
                });
            }    
            if(!recipeName || !amount || !preparationTime || !cookingTime || !status || !DetailIngredients || !Steps) {
                res.status(418).json({
                    status: false,
                    message: 'Please provide all required fields',
                    data: ""
                })
                return
            }

                try {
                    DetailIngredients = JSON.parse(DetailIngredients)
                    Steps = JSON.parse(Steps)
                    let  userId = req.userId
                    console.log(req.files.recipe)
                    const result = await sequelize.transaction(async t => {
                        let recipe = await db.Recipe.create({
                            recipeName: recipeName,
                            date: Date.now(),
                            amount: amount,
                            status: status,
                            preparationTime: preparationTime,
                            image: req.files.recipe ? `/recipe/${req.files.recipe[0].filename}` : null,
                            cookingTime: cookingTime,
                            description: description ? description : null,
                            userId: userId
                        }, { transaction: t })
                        DetailIngredients = DetailIngredients.map(item => {
                            item.recipeId = recipe.recipeId
                            return item
                        })
                        console.log(Steps)
                        console.log(req.files.step)
                        let index = 0
                        for(let i = 0; i < Steps.length; i++){
                            if(Steps[i].image != "") {
                                Steps[i].image = `/step/${req.files.step[index].filename}`
                                index++
                            } else {
                                Steps[i].image = null
                            }
                            Steps[i].recipeId = recipe.recipeId
                        }
                        let ingre = await db.DetailIngredient.bulkCreate(DetailIngredients, { transaction: t })
                        let stepRes = await db.Step.bulkCreate(Steps, { transaction: t })
                        return {recipe, ingre, stepRes}
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


    handleUpdateRecpipe = async (req, res) => {
        let uploadFile = multerConfig().fields([
            {
                name: "recipe",
                maxCount: 1
            },
            {
                name: "step",
                maxCount: 20
            }
        ])
        uploadFile(req, res, async error => {
            if(error){
                return res.status(440).json({
                    success: false,
                    message: `Error when trying to upload: ${error}`,
                    data: ""
                })
            }
            try {
                let { data } = req.body
                let recipeId  = req.params.id
                console.log(req.body)
                console.log(data)
                let recipe = await db.Recipe.findByPk(recipeId)
                let ingredient = await db.DetailIngredient.findAll({where: {recipeId: recipeId}})
                let step = await db.Step.findAll({where: {recipeId: recipeId}})
                data = JSON.parse(data)
                let DetailIngredients = data.DetailIngredients
                let Steps = data.Steps
                step = step.filter(({ stepId: id1 }) => !Steps.some(({ stepId: id2 }) => id2 === id1) );
                step = step.map(item => {
                    return item.dataValues.stepId
                })
                ingredient = ingredient.filter(({ingredientId: id1}) => !DetailIngredients.some(({ingredientId: id2}) => id1 === id2))
                ingredient = ingredient.map(item => {
                    return item.dataValues.ingredientId
                })
                let index = 0
                console.log(req.files.step)
                for(let i = 0; i < Steps.length; i++){

                    if(Steps[i].imageFile) {
                        Steps[i].image = `/step/${req.files.step[index].filename}`
                        index++
                    } 
                    // else {
                    //     Steps[i].image = Steps[i].image
                    // }
                    Steps[i].recipeId = recipe.recipeId
                }
                DetailIngredients = DetailIngredients.map(item => {
                    item.recipeId = recipeId
                    return item
                })
                console.log("Steps1: ", Steps)
                if(recipe) {
                    const updateRecipe = await sequelize.transaction(async t => {
                        if(step.length > 0) {
                            await db.Step.destroy({where: {
                                stepId: {
                                    [Op.or]: step
                                }
                            }}, {transaction: t})
                            await db.Step.bulkCreate(Steps, {
                                updateOnDuplicate: ["stepId", "stepIndex", "description", "recipeId", "image"],
                            } ,{transaction: t})
                        } else {
                            await db.Step.bulkCreate(Steps, {
                                updateOnDuplicate: ["stepId", "stepIndex", "description", "recipeId", "image"],
                            } ,{transaction: t})
                        }
                        if(ingredient.length > 0) {
                            await db.DetailIngredient.destroy(
                                {
                                    where: {
                                        [Op.and]: [
                                            {
                                                ingredientId: {
                                                    [Op.or]: ingredient
                                                }
                                            },
                                            {
                                                recipeId: recipeId
                                            }
                                        ]
                                        
                                    },
                                }, {transaction: t})
                            await db.DetailIngredient.bulkCreate(DetailIngredients, {
                                updateOnDuplicate: ["ingredientId", "recipeId", "amount"]
                            }, {transaction: t})
                        } else {
                            await db.DetailIngredient.bulkCreate(DetailIngredients, {
                                updateOnDuplicate: ["ingredientId", "recipeId", "amount"]
                            }, {transaction: t})
                        }
                        recipe.recipeName = data.recipeName
                        recipe.amount = data.amount
                        recipe.preparationTime = data.preparationTime
                        recipe.cookingTime = data.cookingTime
                        recipe.status = data.status
                        recipe.description = data.description
                        recipe.image = req.files.recipe ? `/recipe/${req.files.recipe[0].filename}` : recipe.image
                        recipe.video = data.video
        
                        await recipe.save({transaction: t})
        
                        res.status(200).json({
                            success: true, 
                            message: 'Successfully updated recipe',
                            data: ""
                        })
                    })

                } else {
                    res.status(432).json({
                        success: false, 
                        message: 'Recipe not found',
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
        })
    }

    handleUpdateRecpipe1 = async (req, res) => {
        let uploadFile = multerConfig().fields([
            {
                name: "recipe",
                maxCount: 1
            },
            {
                name: "step",
                maxCount: 20
            }
        ])
        uploadFile(req, res, async error => {
            if(error){
                return res.status(440).json({
                    success: false,
                    message: `Error when trying to upload: ${error}`,
                    data: ""
                })
            }
            try {
                let { recipeName, amount, status, preparationTime, cookingTime, description, DetailIngredients, Steps} = req.body
                if(!recipeName || !amount || !preparationTime || !cookingTime || !status || !DetailIngredients || !Steps) {
                    res.status(418).json({
                        status: false,
                        message: 'Please provide all required fields',
                        data: ""
                    })
                    return
                }
                let recipeId  = req.params.id
                DetailIngredients = JSON.parse(DetailIngredients)
                Steps = JSON.parse(Steps)
                let recipe = await db.Recipe.findByPk(recipeId)
                let ingredient = await db.DetailIngredient.findAll({where: {recipeId: recipeId}})
                let step = await db.Step.findAll({where: {recipeId: recipeId}})
                step = step.filter(({ stepId: id1 }) => !Steps.some(({ stepId: id2 }) => id2 === id1) );
                step = step.map(item => {
                    return item.dataValues.stepId
                })
                ingredient = ingredient.filter(({ingredientId: id1}) => !DetailIngredients.some(({ingredientId: id2}) => id1 === id2))
                ingredient = ingredient.map(item => {
                    return item.dataValues.ingredientId
                })
                let index = 0
                console.log(req.files)
                for(let i = 0; i < Steps.length; i++){
                    if(Steps[i].imageFile) {
                        console.log(Steps[i].imageFile)
                        Steps[i].image = `/step/${req.files.step[index].filename}`
                        index++
                    } 
                    Steps[i].recipeId = recipe.recipeId
                }
                DetailIngredients = DetailIngredients.map(item => {
                    item.recipeId = recipeId
                    return item
                })
                console.log("Steps1: ", Steps)
                if(recipe) {
                    const updateRecipe = await sequelize.transaction(async t => {
                        if(step.length > 0) {
                            await db.Step.destroy({where: {
                                stepId: {
                                    [Op.or]: step
                                }
                            }}, {transaction: t})
                            await db.Step.bulkCreate(Steps, {
                                updateOnDuplicate: ["stepId", "stepIndex", "description", "recipeId", "image"],
                            } ,{transaction: t})
                        } else {
                            await db.Step.bulkCreate(Steps, {
                                updateOnDuplicate: ["stepId", "stepIndex", "description", "recipeId", "image"],
                            } ,{transaction: t})
                        }
                        if(ingredient.length > 0) {
                            await db.DetailIngredient.destroy(
                                {
                                    where: {
                                        [Op.and]: [
                                            {
                                                ingredientId: {
                                                    [Op.or]: ingredient
                                                }
                                            },
                                            {
                                                recipeId: recipeId
                                            }
                                        ]
                                        
                                    },
                                }, {transaction: t})
                            await db.DetailIngredient.bulkCreate(DetailIngredients, {
                                updateOnDuplicate: ["ingredientId", "recipeId", "amount"]
                            }, {transaction: t})
                        } else {
                            await db.DetailIngredient.bulkCreate(DetailIngredients, {
                                updateOnDuplicate: ["ingredientId", "recipeId", "amount"]
                            }, {transaction: t})
                        }
                        console.log('allala')
                        recipe.recipeName = recipeName
                        recipe.amount = amount
                        recipe.preparationTime = preparationTime
                        recipe.cookingTime = cookingTime
                        recipe.status = status
                        recipe.description = description
                        recipe.image = req.files.recipe ? `/recipe/${req.files.recipe[0].filename}` : recipe.image
        
                        await recipe.save({transaction: t})
        
                        res.status(200).json({
                            success: true, 
                            message: 'Successfully updated recipe',
                            data: ""
                        })
                    })

                } else {
                    res.status(432).json({
                        success: false, 
                        message: 'Recipe not found',
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
        })
    }

    handleDeleteRecipe = async (req, res) => {
        try {
            let { id } = req.params
            let recipe = await db.Recipe.findByPk(id)
            if(recipe) {
                const prm0 = new Promise((resolve, rejects) => {
                    let x = db.DetailList.destroy({where: {recipeId: id}})
                    resolve(x)
                })
                const prm1 = new Promise((resolve, rejects) => {
                    let x = db.Favorite.destroy({where: {recipeId: id}})
                    resolve(x)
                })
                const prm2 = new Promise((resolve, rejects) => {
                    let x = db.Comment.destroy({where: {recipeId: id}})
                    resolve(x)
                })
                const prm3 = new Promise((resolve, rejects) => {
                    let x = db.Step.destroy({where: {recipeId: id}})
                    resolve(x)
                })
                const prm4 = new Promise((resolve, rejects) => {
                    let x = db.DetailIngredient.destroy({where: {recipeId: id}})
                    resolve(x)
                })
                const prm5 = new Promise((resolve, rejects) => {
                    let x = recipe.destroy()
                    resolve(x)
                })

                await Promise.all([prm0, prm1, prm2, prm3, prm4, prm5])

                res.status(200).json({
                    success: true, 
                    message: 'Successfully deleted recipe',
                    data: ""
                })
                return
            }
            res.status(432).json({
                success: false,
                message: 'Recipe not found',
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

    getDetailRecipe = async (req, res) => {
        try {
            // Get id in URL
            // http://localhost:8080/api/v1/recipe/getRecipe/4   id = 4
            let userId = req.userId
            let recipeId  = req.params.id
            let recipe = await db.Recipe.findByPk(recipeId, {
                    include: [
                    {
                        model: db.Step,
                        attributes: {exclude: ["createdAt", "updatedAt", "recipeId"]}
                    },
                    {
                        model: db.User,
                        attributes: [
                            "userId", "fullName", "avatar", "introduce", "address",
                            [sequelize.literal(` (SELECT CASE WHEN EXISTS 
                                (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                                then True else False end isFollow) `), "isFollow"]
                        ]
                    },
                    {
                        model: db.DetailList,
                        include: {
                            model: db.RecipeList,
                            attributes: ["name"]
                        },
                        attributes: ["recipeListId"]
                    }, 
                    {
                        model: db.DetailIngredient,
                        include: {
                            model: db.Ingredient,
                            attributes: ["name"]
                        },
                        attributes: ["ingredientId", "amount"]
                    }
                    ],
                    attributes: {
                        exclude: ["createdAt", "updatedAt"], 
                        include: [
                            [sequelize.literal(`(SELECT CASE WHEN EXISTS 
                            (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
                            THEN True ELSE False end isFavorite) `), "isFavorite"], 
                    ]}
                })
        
            recipe.dataValues.Steps.sort((x, y) => {
                return x.stepIndex - y.stepIndex
            })
            recipe.dataValues.DetailLists.map(item => {
                item.dataValues.name = item.dataValues.RecipeList.dataValues.name
                delete item.dataValues['RecipeList']
                return item
            })
            recipe.dataValues.DetailIngredients.map(item => {
                item.dataValues.name = item.dataValues.Ingredient.dataValues.name
                delete item.dataValues['Ingredient']
                return item
            })
            if(recipe) {
                res.json({
                    success: true,
                    message: "Successfully get data",
                    data: recipe,
                })
                return
            }
            res.status(432).json({
                success: false, 
                message: 'Recipe not found',
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

    handleSearchRecipe = async (req, res) => {
        try {

            // http://localhost:8080/api/v1/recipe/search?q=mì
            const {q} = req.query
            let recipe = await db.Recipe.findAll({
                where: {
                    [Op.and]: [
                        {
                            recipeName: {
                                [Op.iLike]: `%${q}%`
                            }
                        },
                        {
                            status: 'CK'
                        }
                    ]
                },
                attributes: ["recipeName"]
            })

            if(recipe && recipe.length > 0){
                res.status(200).json({
                    success: true,
                    message: 'Successfully search',
                    data: recipe
                })
                return
            }

            res.status(432).json({
                success: false, 
                message: 'Recipe not found',
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

    updatePrivacyOfRecipe = async (req, res) => {
        try {
            let { id } = req.params
            let {status} = req.body
            console.log(status)
            console.log(req.body)
            let recipe = await db.Recipe.findByPk(id)

            if(recipe) {
                recipe.status = status

                let recipeData = await recipe.save()
                res.status(200).json({
                    success: true,
                    message: 'Successfully updated recipe',
                    data: recipeData
                })
                return
            }
            res.status(432).json({
                success: false, 
                message: 'Recipe not found',
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

    getRecipeByIngredient = async (req, res) => {
        try {
            let { slug } = req.params
            let userId = req.userId
            let recipe = await db.Recipe.findAll({
                where: {
                    status: 'CK'
                },
                include: [ 
                    {
                        required: true,
                        model: db.DetailIngredient,
                        include: { 
                            model: db.Ingredient,
                            where: {
                                name: slug
                            },
                            attributes: []
                        },
                        attributes: [],
                    },
                    {
                        model: db.User,
                        attributes: [
                            "fullName", "avatar", "userId",
                            [sequelize.literal(` (SELECT CASE WHEN EXISTS 
                                (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                                then True else False end isFollow) `), "isFollow"]
                        ]
                    },
                    {
                        model: db.DetailList,
                        include: {
                            model: db.RecipeList,
                            attributes: ["name"]
                        },
                        attributes: ["recipeListId"]
                    }, 
                ],
                attributes: [
                    "recipeId", "recipeName", "date", "numberOfLikes", "image", "status",
                    [sequelize.literal(`(SELECT CASE WHEN EXISTS 
                        (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
                        THEN True ELSE False end isFavorite) `), "isFavorite"]
                ]
            })
            if(recipe && recipe.length > 0) {
                recipe.map(item => {
                    item.dataValues.DetailLists.map(item => {
                        item.dataValues.name = item.dataValues.RecipeList.dataValues.name
                        delete item.dataValues['RecipeList']
                        return item
                    })
                })
                res.status(200).json({
                    success: true,
                    message: 'Successfully get data',
                    data: recipe
                })
                return
            }
            res.status(428).json({
                success: false, 
                message: `Don't have recipe with '${slug}'`,
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

    getPopularRecipe = async (req, res) => {
        let userId = req.userId
        let today = new Date()
        var newDate = new Date(today.getTime() - (60*60*24*7*1000)) // lấy 7 ngày trước
        try {
            let recipe = await db.Recipe.findAll({
                where: {
                    [Op.and]: [
                        {
                            date: {
                                [Op.lt]: today,
                                [Op.gt]: newDate
                            }
                        },
                        {
                            status: 'CK'
                        }
                    ]
                    
                },
                include: [
                    {   
                        model: db.Comment,
                        attributes: []
                    },
                    {
                        model: db.User,
                        attributes: [
                            "fullName", "avatar", "userId",
                            [sequelize.literal(` (SELECT CASE WHEN EXISTS 
                                (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                                then True else False end isFollow) `), "isFollow"]
                        ]
                    },
                    {
                        model: db.DetailList,
                        include: {
                            model: db.RecipeList,
                            attributes: ["name"]
                        },
                        attributes: ["recipeListId"]
                    },
                ],
                attributes: [
                    "recipeId", "recipeName", "date", "numberOfLikes", "image", "status",
                    [sequelize.fn('COUNT', sequelize.col('Comments.recipeId')), 'count'],
                    [sequelize.literal(`(SELECT CASE WHEN EXISTS 
                        (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
                        THEN True ELSE False end isFavorite) `), "isFavorite"]
                ],
                group: [
                    'Recipe.recipeId', "User.fullName", "User.avatar", "User.userId", "DetailLists.recipeId", 
                    "DetailLists.recipeListId", "DetailLists->RecipeList.recipeListId"
                ],
                order: [
                    ['numberOfLikes', 'DESC'],
                    ['count', 'DESC'],
                    ['date', 'ASC']
                ]
            })
            if(recipe && recipe.length > 0) {
                recipe.map(item => {
                    item.dataValues.DetailLists.map(item => {
                        item.dataValues.name = item.dataValues.RecipeList.dataValues.name
                        delete item.dataValues['RecipeList']
                        return item
                    })
                })
                return res.status(200).json({
                    success: true,
                    message: "Successfully get data",
                    data: recipe
                })
            }
            res.status(432).json({
                success: false,
                message: "Recipe not found",
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

    getRecipeFromFollowers = async (req, res) => {
        try {
            const userId = req.userId
            let followers = await db.Follow.findAll({
                where: {
                    userIdFollow: userId,
                    isSeen: false,
                },
                attributes: ["userIdFollowed"]
            })
            if(followers && followers.length == 0) {
                res.status(436).json({
                    success: false,
                    message: "User do not follow anyone or do not have update from anyone",
                    data: "",
                })
                return
            }
            let newFollowerData = followers.map(item => item.dataValues.userIdFollowed)
            let recipe = await db.Recipe.findAll({
                where: {
                    [Op.and]: [
                        {
                            userId: {
                                [Op.or]: [newFollowerData]
                            }
                        },
                        {
                            status: 'CK'
                        }
                    ]
                },
                include: [
                    {
                        model: db.User,
                        attributes: [
                            "fullName", "avatar", "userId",
                            [sequelize.literal(` (SELECT CASE WHEN EXISTS 
                                (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                                then True else False end isFollow) `), "isFollow"]
                        ]
                    },
                    {
                        model: db.DetailList,
                        include: {
                            model: db.RecipeList,
                            attributes: ["name"]
                        },
                        attributes: ["recipeListId"]
                    }, 
                ],
                    attributes: [
                        "recipeId", "recipeName", "date", "numberOfLikes", "image", "status",
                        [sequelize.literal(`(SELECT CASE WHEN EXISTS 
                            (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
                            THEN True ELSE False end isFavorite) `), "isFavorite"]
                    ],
                    order: [["date", 'DESC']]
            })
            if(recipe && recipe.length > 0 ){
                recipe.map(item => {
                    item.dataValues.DetailLists.map(item => {
                        item.dataValues.name = item.dataValues.RecipeList.dataValues.name
                        delete item.dataValues['RecipeList']
                        return item
                    })
                })
                res.status(200).json({
                    success: true,
                    message: "Successfully get data",
                    data: recipe,
                })
                return
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error,
                data: ""
            })
        }
    }

    handleGetRecipeByName = async (req, res) => {
        try {
            const userId = req.userId
            const {slug} = req.params
            const recipe = await db.Recipe.findAll({
                where: {
                    recipeName: {
                        [Op.iLike]: `%${slug}%`
                    }
                },
                include: {
                    model: db.User,
                    attributes: ["fullName", "avatar", "userId", 
                    [sequelize.literal(` (SELECT CASE WHEN EXISTS 
                        (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                        then True else False end isFollow) `), "isFollow"]
                    ]
                },
                    attributes: ["recipeId", "recipeName", "date", "numberOfLikes", "image", "description", "status",
                    [sequelize.literal(`(SELECT CASE WHEN EXISTS 
                        (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
                        THEN True ELSE False end isFavorite) `), "isFavorite"]    
                ],
                    order: [["date", 'DESC']]
            })
            if(recipe && recipe.length > 0){
                res.status(200).json({
                    success: true,
                    message: "Successfully get data",
                    data: recipe
                })
                return
            }

            res.status(432).json({
                success: false,
                message: "Recipe not found",
                data: ""
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error,
                data: ""
            })
        }
    }

    getRecipeByUserId = async (req, res) => {
        try {
            const userId = req.userId
            const recipe = await db.Recipe.findAll({
                where: {
                    userId: userId
                },
                order: [["date", "DESC"]],
                attributes: [
                    "recipeId", "recipeName", "date", "numberOfLikes", "image", "status",
                    [sequelize.literal(`(SELECT CASE WHEN EXISTS 
                        (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
                        THEN True ELSE False end isFavorite) `), "isFavorite"]
                ], 
                include: [
                    {
                        model: db.DetailList,
                        include: {
                            model: db.RecipeList,
                            attributes: ["name"]
                        },
                        attributes: ["recipeListId"]
                    }, 
                ]
            })
            const user = await db.User.findByPk(userId)
            if(recipe && recipe.length > 0) {
                recipe.map(item => {
                    item.dataValues.DetailLists.map(item => {
                        item.dataValues.name = item.dataValues.RecipeList.dataValues.name
                        delete item.dataValues['RecipeList']
                        return item
                    })
                })
                const newData = {user, recipe}
                res.status(200).json({
                    success: true,
                    message: "Successfully get data",
                    data: recipe
                })
                return
            }

            res.status(432).json({
                success: true,
                message: "Recipe not found",
                data: recipe
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error,
                data: ""
            })
        }
    }

    getRecipeByUserId1 = async (req, res) => {
        try {
            const userId = req.params.userId
            const userId1 = req.userId
            const recipe = await db.Recipe.findAll({
                where: {
                    [Op.and]: [
                        {
                            userId: userId
                        },
                        {
                            status: 'CK'
                        }
                    ]
                },
                order: [["date", "DESC"]],
                attributes: [
                    "recipeId", "recipeName", "date", "numberOfLikes", "image", "status",
                    [sequelize.literal(`(SELECT CASE WHEN EXISTS 
                        (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId1}) 
                        THEN True ELSE False end isFavorite) `), "isFavorite"]
                ], 
                include: [
                    {
                        model: db.DetailList,
                        include: {
                            model: db.RecipeList,
                            attributes: ["name"]
                        },
                        attributes: ["recipeListId"]
                    }, 
                    {
                        model: db.User,
                        attributes: ["fullName", "avatar", "userId", 
                        [sequelize.literal(` (SELECT CASE WHEN EXISTS 
                            (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId1}) 
                            then True else False end isFollow) `), "isFollow"]
                        ]
                    },
                ]
            })
            const user = await db.User.findByPk(userId)
            if(recipe && recipe.length > 0) {
                recipe.map(item => {
                    item.dataValues.DetailLists.map(item => {
                        item.dataValues.name = item.dataValues.RecipeList.dataValues.name
                        delete item.dataValues['RecipeList']
                        return item
                    })
                })
                const newData = {user, recipe}
                res.status(200).json({
                    success: true,
                    message: "Successfully get data",
                    data: recipe
                })
                return
            }

            res.status(432).json({
                success: true,
                message: "Recipe not found",
                data: recipe
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error,
                data: ""
            })
        }
    }

    searchRecipe = async (req, res) => {
        try {

            // http://localhost:8080/api/v1/recipe/search?q=mì
            const {q} = req.query
            const userId = req.userId
            let recipe = await db.Recipe.findAll({
                include: {
                    model: db.User,
                    attributes: [
                        "fullName", "avatar", "userId",
                        [sequelize.literal(` (SELECT CASE WHEN EXISTS 
                            (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                            then True else False end isFollow) `), "isFollow"]
                    ]
                },
                attributes: [
                    "recipeId", "recipeName", "date", "numberOfLikes", "image", "status",
                    [sequelize.literal(`(SELECT CASE WHEN EXISTS 
                        (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
                        THEN True ELSE False end isFavorite) `), "isFavorite"]
                ],
                where: {
                    recipeName: {
                        [Op.iLike]: `%${q}%`
                    }
                },
            })

            if(recipe && recipe.length > 0){
                res.status(200).json({
                    success: true,
                    message: 'Successfully search',
                    data: recipe
                })
                return
            }

            res.status(432).json({
                success: false, 
                message: 'Recipe not found',
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

    getRecipeFavorite = async (req, res) => {
        try {
            const userId = req.userId
            let recipeFavorite = await db.Favorite.findAll({
                where: {
                    userId: userId
                },
                attributes: ["recipeId"]
            })
            let recipeId = recipeFavorite.map(item => item.dataValues.recipeId)
            let recipe = await db.Recipe.findAll({
                where: {
                    recipeId: {
                        [Op.or]: [recipeId]
                    }
                },
                include: {
                    model: db.User,
                    attributes: [
                        "userId", "fullName", "avatar",
                        [sequelize.literal(` (SELECT CASE WHEN EXISTS 
                            (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                            then True else False end isFollow) `), "isFollow"]
                    ]
                },
                attributes: ["recipeId", "recipeName", "date", "numberOfLikes", "image", "status"]
            })
            if(recipe && recipe.length > 0) {

                res.status(200).json({
                    success: true,
                    message: 'Successfully search',
                    data: recipe
                })
                return
            }
            res.status(400).json({
                success: false,
                message: 'User do not have any recipe',
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



module.exports = new recipeController