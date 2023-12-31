const { 
  RECIPE_NAME_BLANK_ERROR, 
  AMOUNT_BLANK_ERROR, 
  PREPARATION_TIME_BLANK_ERROR, 
  COOKING_TIME_BLANK_ERROR, 
  STATUS_BLANK_ERROR, 
  IMAGE_BLANK_ERROR, 
  INGREDIENT_BLANK_ERROR, 
  STEP_BLANK_ERROR, 
  INTERNAL_ERROR,
  SUCCESS_CREATE_RECIPE
} = require("../contants/error-code");
const { RECIPE_NOT_FOUND, SUCCESS_DELETE_RECIPE, SUCCESS_SEARCH, RECIPE_NOT_FOUND_1 } = require("../contants/error-code/recipe");
const { SUCCESS_GET_DATA, BLANK_FIELDS, SUCCESS_UPDATE } = require("../contants/error-code/user");
const db = require("../models");
const { sequelize } = require("../models/index");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
require("dotenv").config();

class recipeController {
  getRecipe = async (req, res) => {
    try {
      const userId = req.userId;
      // Select * from Recipe, User where Recipe.userId = User.userId
      let data = await db.Recipe.findAll({
        where: {
          status: "CK",
        },
        include: [
          {
            model: db.User,
            attributes: [
              "fullName",
              "avatar",
              "userId",
              [
                sequelize.literal(` (SELECT CASE WHEN EXISTS 
                  (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                  then True else False end isFollow) `),
                "isFollow",
              ],
            ],
          },
          {
            model: db.DetailList,
            include: {
              model: db.RecipeList,
              attributes: ["name"],
            },
            attributes: ["recipeListId"],
          },
        ],
        attributes: [
          "recipeId",
          "recipeName",
          "date",
          "numberOfLikes",
          "image",
          "status",
          [
            sequelize.literal(`(SELECT CASE WHEN EXISTS 
                        (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
                        THEN True ELSE False end isFavorite) `),
            "isFavorite",
          ],
        ],
        order: [["date", "DESC"]],
      });
      if (data && data.length > 0) {
        data.map((item) => {
          item.dataValues.DetailLists.map((item) => {
            item.dataValues.name = item.dataValues.RecipeList.dataValues.name;
            delete item.dataValues["RecipeList"];
            return item;
          });
        });
        return res.status(200).json({
          success: true,
          message: SUCCESS_GET_DATA,
          data: data,
        });
      }
      res.status(429).json({
        success: false,
        message: RECIPE_NOT_FOUND,
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  handleCreateRecipe = async (req, res) => {
    let {
      recipeName,
      amount,
      status,
      preparationTime,
      cookingTime,
      description,
      DetailIngredients,
      Steps,
      image,
      video,
    } = req.body;

    if(!recipeName) {
      return res.status(418).json({
        status: false,
        message: RECIPE_NAME_BLANK_ERROR,
        data: "",
      });
    }

    if(!amount) {
      return res.status(418).json({
        status: false,
        message: AMOUNT_BLANK_ERROR,
        data: "",
      });
    }

    if(!preparationTime) {
      return res.status(418).json({
        status: false,
        message: PREPARATION_TIME_BLANK_ERROR,
        data: "",
      });
    }

    if(!cookingTime) {
      return res.status(418).json({
        status: false,
        message: COOKING_TIME_BLANK_ERROR,
        data: "",
      });
    }

    if(!status) {
      return res.status(418).json({
        status: false,
        message: STATUS_BLANK_ERROR,
        data: "",
      });
    }

    if(!image) {
      return res.status(418).json({
        status: false,
        message: IMAGE_BLANK_ERROR,
        data: "",
      });
    }

    if(!DetailIngredients) {
      return res.status(418).json({
        status: false,
        message: INGREDIENT_BLANK_ERROR,
        data: "",
      });
    }

    if(!Steps) {
      return res.status(418).json({
        status: false,
        message: STEP_BLANK_ERROR,
        data: "",
      });
    }

    try {
      let userId = req.userId;
      const result = await sequelize.transaction(async (t) => {
        let recipe = await db.Recipe.create(
          {
            recipeName: recipeName,
            date: Date.now(),
            amount: amount,
            status: status,
            preparationTime: preparationTime,
            image: image,
            cookingTime: cookingTime,
            description: description ? description : null,
            video: video && video,
            userId: userId,
          },
          { transaction: t }
        );
        DetailIngredients = DetailIngredients.map((item) => {
          item.recipeId = recipe.recipeId;
          return item;
        });

        let ingre = await db.DetailIngredient.bulkCreate(DetailIngredients, {
          transaction: t,
        });
        Steps = Steps.map((item) => {
          item.recipeId = recipe.recipeId;
          return item;
        });
        let stepRes = await db.Step.bulkCreate(Steps, { transaction: t });
        return { recipe, stepRes };
      });
      res.status(200).json({
        success: true,
        message: SUCCESS_CREATE_RECIPE,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: INTERNAL_ERROR,
        data: "",
      });
    }
  };

    handleUpdateRecpipe = async (req, res) => {
    try {
      let {
        recipeName,
        amount,
        status,
        preparationTime,
        cookingTime,
        description,
        image,
        video,
        DetailIngredients,
        Steps,
      } = req.body;
      if (
        !recipeName ||
        !amount ||
        !preparationTime ||
        !cookingTime ||
        !status ||
        !DetailIngredients ||
        !Steps ||
        !image
      ) {
        res.status(418).json({
          status: false,
          message: BLANK_FIELDS,
          data: "",
        });
        return;
      }
      let recipeId = req.params.id;
      // DetailIngredients = JSON.parse(DetailIngredients);
      // Steps = JSON.parse(Steps);
      let recipe = await db.Recipe.findByPk(recipeId);
      let ingredient = await db.DetailIngredient.findAll({
        where: { recipeId: recipeId },
      });
      let step = await db.Step.findAll({ where: { recipeId: recipeId } });
      step = step.filter(
        ({ stepId: id1 }) => !Steps.some(({ stepId: id2 }) => id2 === id1)
      );
      step = step.map((item) => {
        return item.dataValues.stepId;
      });
      ingredient = ingredient.filter(
        ({ ingredientId: id1 }) =>
          !DetailIngredients.some(({ ingredientId: id2 }) => id1 === id2)
      );
      ingredient = ingredient.map((item) => {
        return item.dataValues.ingredientId;
      });
      Steps.map((item) => {
        item.recipeId = recipeId;
        return item;
      });
      DetailIngredients = DetailIngredients.map((item) => {
        item.recipeId = recipeId;
        return item;
      });
      if (recipe) {
        const updateRecipe = await sequelize.transaction(async (t) => {
          if (step.length > 0) {
            await db.Step.destroy(
              {
                where: {
                  stepId: {
                    [Op.or]: step,
                  },
                },
              },
              { transaction: t }
            );
            await db.Step.bulkCreate(
              Steps,
              {
                updateOnDuplicate: [
                  "stepId",
                  "stepIndex",
                  "description",
                  "recipeId",
                  "image",
                ],
              },
              { transaction: t }
            );
          } else {
            await db.Step.bulkCreate(
              Steps,
              {
                updateOnDuplicate: [
                  "stepId",
                  "stepIndex",
                  "description",
                  "recipeId",
                  "image",
                ],
              },
              { transaction: t }
            );
          }
          if (ingredient.length > 0) {
            await db.DetailIngredient.destroy(
              {
                where: {
                  [Op.and]: [
                    {
                      ingredientId: {
                        [Op.or]: ingredient,
                      },
                    },
                    {
                      recipeId: recipeId,
                    },
                  ],
                },
              },
              { transaction: t }
            );
            await db.DetailIngredient.bulkCreate(
              DetailIngredients,
              {
                updateOnDuplicate: ["ingredientId", "recipeId", "amount"],
              },
              { transaction: t }
            );
          } else {
            await db.DetailIngredient.bulkCreate(
              DetailIngredients,
              {
                updateOnDuplicate: ["ingredientId", "recipeId", "amount"],
              },
              { transaction: t }
            );
          }
          let recipeImage = "";
          let recipeVideo = "";
          if (image !== recipe.image && recipe.image) {
            recipeImage = image;
          }

          if (video !== recipe.video && recipe.video) {
            recipeVideo = video;
          }
          recipe.recipeName = recipeName;
          recipe.amount = amount;
          recipe.preparationTime = preparationTime;
          recipe.cookingTime = cookingTime;
          recipe.status = status;
          recipe.description = description;
          recipe.image = recipeImage ? recipeImage : image;
          recipe.video = recipeVideo ? recipeVideo : video;

          await recipe.save({ transaction: t });

          res.status(200).json({
            success: true,
            message: SUCCESS_UPDATE,
            data: "",
          });
        });
      } else {
        res.status(432).json({
          success: false,
          message: RECIPE_NOT_FOUND,
          data: "",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  handleDeleteRecipe = async (req, res) => {
    try {
      let { id } = req.params;
      let recipe = await db.Recipe.findByPk(id);
      if (recipe) {
        const prm0 = new Promise((resolve, rejects) => {
          let x = db.DetailList.destroy({ where: { recipeId: id } });
          resolve(x);
        });
        const prm1 = new Promise((resolve, rejects) => {
          let x = db.Favorite.destroy({ where: { recipeId: id } });
          resolve(x);
        });
        const prm2 = new Promise((resolve, rejects) => {
          let x = db.Comment.destroy({ where: { recipeId: id } });
          resolve(x);
        });
        const prm3 = new Promise((resolve, rejects) => {
          let x = db.Step.destroy({ where: { recipeId: id } });
          resolve(x);
        });
        const prm4 = new Promise((resolve, rejects) => {
          let x = db.DetailIngredient.destroy({ where: { recipeId: id } });
          resolve(x);
        });
        const prm5 = new Promise((resolve, rejects) => {
          let x = recipe.destroy();
          resolve(x);
        });

        await Promise.all([prm0, prm1, prm2, prm3, prm4, prm5]);

        res.status(200).json({
          success: true,
          message: SUCCESS_DELETE_RECIPE,
          data: "",
        });
        return;
      }
      res.status(432).json({
        success: false,
        message: RECIPE_NOT_FOUND,
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  getDetailRecipe = async (req, res) => {
    try {
      // Get id in URL
      // http://localhost:8080/api/v1/recipe/getRecipe/4   id = 4
      let userId = req.userId;
      let recipeId = req.params.id;
      let recipe = await db.Recipe.findByPk(recipeId, {
        include: [
          {
            model: db.Step,
            attributes: { exclude: ["createdAt", "updatedAt", "recipeId"] },
          },
          {
            model: db.User,
            attributes: [
              "userId",
              "fullName",
              "avatar",
              "introduce",
              "address",
              [
                sequelize.literal(` (SELECT CASE WHEN EXISTS 
                  (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                  then True else False end isFollow) `),
                "isFollow",
              ],
            ],
          },
          {
            model: db.DetailList,
            include: {
              model: db.RecipeList,
              attributes: ["name"],
            },
            attributes: ["recipeListId"],
          },
          {
            model: db.DetailIngredient,
            include: {
              model: db.Ingredient,
              attributes: ["name"],
            },
            attributes: ["ingredientId", "amount"],
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt"],
          include: [
            [
              sequelize.literal(`(SELECT CASE WHEN EXISTS 
                (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
                THEN True ELSE False end isFavorite) `),
              "isFavorite",
            ],
          ],
        },
      });

      recipe.dataValues.Steps.sort((x, y) => {
        return x.stepIndex - y.stepIndex;
      });
      recipe.dataValues.DetailLists.map((item) => {
        item.dataValues.name = item.dataValues.RecipeList.dataValues.name;
        delete item.dataValues["RecipeList"];
        return item;
      });
      recipe.dataValues.DetailIngredients.map((item) => {
        const result = item.dataValues.amount.match(/\d+|\D+/g);
        item.dataValues.amount = result[0];
        item.dataValues.unit = result[1];
        item.dataValues.name = item.dataValues.Ingredient.dataValues.name;
        delete item.dataValues["Ingredient"];
        return item;
      });
      if (recipe) {
        res.json({
          success: true,
          message: SUCCESS_GET_DATA,
          data: recipe,
        });
        return;
      }
      res.status(432).json({
        success: false,
        message: RECIPE_NOT_FOUND,
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  handleSearchRecipe = async (req, res) => {
    try {
      // http://localhost:8080/api/v1/recipe/search?q=mì
      const { q } = req.query;
      let recipe = await db.Recipe.findAll({
        where: {
          [Op.and]: [
            {
              recipeName: {
                [Op.iLike]: `%${q}%`,
              },
            },
            {
              status: "CK",
            },
          ],
        },
        attributes: ["recipeName"],
      });

      if (recipe && recipe.length > 0) {
        const uniqueArr = [...new Set(recipe.map(item => item.dataValues.recipeName))].map(recipeName => ({recipeName}));
        res.status(200).json({
          success: true,
          message: SUCCESS_SEARCH,
          data: uniqueArr,
        });
        return;
      }

      res.status(432).json({
        success: false,
        message: SUCCESS_SEARCH,
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  updatePrivacyOfRecipe = async (req, res) => {
    try {
      let { id } = req.params;
      let { status } = req.body;
      let recipe = await db.Recipe.findByPk(id);

      if (recipe) {
        recipe.status = status;

        let recipeData = await recipe.save();
        res.status(200).json({
          success: true,
          message: SUCCESS_UPDATE,
          data: recipeData,
        });
        return;
      }
      res.status(432).json({
        success: false,
        message: RECIPE_NOT_FOUND,
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  getRecipeByIngredient = async (req, res) => {
    try {
      let { slug } = req.params;
      let userId = req.userId;
      let recipe = await db.Recipe.findAll({
        where: {
          status: "CK",
        },
        include: [
          {
            required: true,
            model: db.DetailIngredient,
            include: {
              model: db.Ingredient,
              where: {
                name: slug,
              },
              attributes: [],
            },
            attributes: [],
          },
          {
            model: db.User,
            attributes: [
              "fullName",
              "avatar",
              "userId",
              [
                sequelize.literal(` (SELECT CASE WHEN EXISTS 
                  (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                  then True else False end isFollow) `),
                "isFollow",
              ],
            ],
          },
          {
            model: db.DetailList,
            include: {
              model: db.RecipeList,
              attributes: ["name"],
            },
            attributes: ["recipeListId"],
          },
        ],
        attributes: [
          "userId",
          "recipeId",
          "recipeName",
          "date",
          "numberOfLikes",
          "image",
          "status",
          [
            sequelize.literal(`(SELECT CASE WHEN EXISTS 
              (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
              THEN True ELSE False end isFavorite) `),
            "isFavorite",
          ],
        ],
      });
      if (recipe && recipe.length > 0) {
        recipe.map((item) => {
          if(item.dataValues.userId === userId) {
            item.dataValues.isMyRecipe = true
          } else {
            item.dataValues.isMyRecipe = false
          }
          item.dataValues.DetailLists.map((item) => {
            item.dataValues.name = item.dataValues.RecipeList.dataValues.name;
            delete item.dataValues["RecipeList"];
            return item;
          });
        });
        res.status(200).json({
          success: true,
          message: SUCCESS_GET_DATA,
          data: recipe,
        });
        return;
      }
      res.status(428).json({
        success: false,
        message: RECIPE_NOT_FOUND_1 + `${slug}`,
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  getPopularRecipe = async (req, res) => {
    let userId = req.userId;
    let today = new Date();
    var newDate = new Date(today.getTime() - 60 * 60 * 24 * 7 * 1000); // lấy 7 ngày trước
    try {
      let recipe = await db.Recipe.findAll({
        where: {
          [Op.and]: [
            {
              date: {
                [Op.lt]: today,
                [Op.gt]: newDate,
              },
            },
            {
              status: "CK",
            },
          ],
        },
        include: [
          {
            model: db.Comment,
            attributes: [],
          },
          {
            model: db.User,
            attributes: [
              "fullName",
              "avatar",
              "userId",
              [
                sequelize.literal(` (SELECT CASE WHEN EXISTS 
                  (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                  then True else False end isFollow) `),
                "isFollow",
              ],
            ],
          },
          {
            model: db.DetailList,
            include: {
              model: db.RecipeList,
              attributes: ["name"],
            },
            attributes: ["recipeListId"],
          },
        ],
        attributes: [
          "userId",
          "recipeId",
          "recipeName",
          "date",
          "numberOfLikes",
          "image",
          "status",
          [sequelize.fn("COUNT", sequelize.col("Comments.recipeId")), "count"],
          [
            sequelize.literal(`(SELECT CASE WHEN EXISTS 
              (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
              THEN True ELSE False end isFavorite) `),
            "isFavorite",
          ],
        ],
        group: [
          "Recipe.recipeId",
          "User.fullName",
          "User.avatar",
          "User.userId",
          "DetailLists.recipeId",
          "DetailLists.recipeListId",
          "DetailLists->RecipeList.recipeListId",
        ],
        order: [
          ["numberOfLikes", "DESC"],
          ["count", "DESC"],
          ["date", "ASC"],
        ],
      });
      if (recipe && recipe.length > 0) {
        recipe.map((item) => {
          if(item.dataValues.userId === userId) {
            item.dataValues.isMyRecipe = true
          } else {
            item.dataValues.isMyRecipe = false
          }
          item.dataValues.DetailLists.map((item) => {
            item.dataValues.name = item.dataValues.RecipeList.dataValues.name;
            delete item.dataValues["RecipeList"];
            return item;
          });
        });
        return res.status(200).json({
          success: true,
          message: SUCCESS_GET_DATA,
          data: recipe,
        });
      }
      res.status(432).json({
        success: false,
        message: RECIPE_NOT_FOUND,
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  getRecipeFromFollowers = async (req, res) => {
    try {
      const userId = req.userId;
      let followers = await db.Follow.findAll({
        where: {
          userIdFollow: userId,
          isSeen: false,
        },
        attributes: ["userIdFollowed"],
      });
      if (followers && followers.length == 0) {
        res.status(436).json({
          success: false,
          message:
            "User do not follow anyone or do not have update from anyone",
          data: "",
        });
        return;
      }
      let newFollowerData = followers.map(
        (item) => item.dataValues.userIdFollowed
      );
      let recipe = await db.Recipe.findAll({
        where: {
          [Op.and]: [
            {
              userId: {
                [Op.or]: [newFollowerData],
              },
            },
            {
              status: "CK",
            },
          ],
        },
        include: [
          {
            model: db.User,
            attributes: [
              "fullName",
              "avatar",
              "userId",
              [
                sequelize.literal(` (SELECT CASE WHEN EXISTS 
                  (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                  then True else False end isFollow) `),
                "isFollow",
              ],
            ],
          },
          {
            model: db.DetailList,
            include: {
              model: db.RecipeList,
              attributes: ["name"],
            },
            attributes: ["recipeListId"],
          },
        ],
        attributes: [
          "userId",
          "recipeId",
          "recipeName",
          "date",
          "numberOfLikes",
          "image",
          "status",
          [
            sequelize.literal(`(SELECT CASE WHEN EXISTS 
              (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
              THEN True ELSE False end isFavorite) `),
            "isFavorite",
          ],
        ],
        order: [["date", "DESC"]],
      });
      if (recipe && recipe.length > 0) {
        recipe.map((item) => {
          if(item.dataValues.userId === userId) {
            item.dataValues.isMyRecipe = true
          } else {
            item.dataValues.isMyRecipe = false
          }
          item.dataValues.DetailLists.map((item) => {
            item.dataValues.name = item.dataValues.RecipeList.dataValues.name;
            delete item.dataValues["RecipeList"];
            return item;
          });
        });
        res.status(200).json({
          success: true,
          message: SUCCESS_GET_DATA,
          data: recipe,
        });
        return;
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error,
        data: "",
      });
    }
  };

  handleGetRecipeByName = async (req, res) => {
    try {
      const userId = req.userId;
      const { slug } = req.params;
      const recipe = await db.Recipe.findAll({
        where: {
          recipeName: {
            [Op.iLike]: `%${slug}%`,
          },
        },
        include: {
          model: db.User,
          attributes: [
            "fullName",
            "avatar",
            "userId",
            [
              sequelize.literal(` (SELECT CASE WHEN EXISTS 
                (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                then True else False end isFollow) `),
              "isFollow",
            ],
          ],
        },
        attributes: [
          "recipeId",
          "recipeName",
          "date",
          "numberOfLikes",
          "image",
          "description",
          "status",
          [
            sequelize.literal(`(SELECT CASE WHEN EXISTS 
              (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
              THEN True ELSE False end isFavorite) `),
            "isFavorite",
          ],
        ],
        order: [["date", "DESC"]],
      });
      if (recipe && recipe.length > 0) {
        res.status(200).json({
          success: true,
          message: SUCCESS_GET_DATA,
          data: recipe,
        });
        return;
      }

      res.status(432).json({
        success: false,
        message: RECIPE_NOT_FOUND,
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error,
        data: "",
      });
    }
  };

  getMyRecipe = async (req, res) => {
    try {
      const userId = req.userId;
      const recipe = await db.Recipe.findAll({
        where: {
          userId: userId,
        },
        order: [["date", "DESC"]],
        attributes: [
          "userId",
          "recipeId",
          "recipeName",
          "date",
          "numberOfLikes",
          "image",
          "status",
          [
            sequelize.literal(`(SELECT CASE WHEN EXISTS 
              (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
              THEN True ELSE False end isFavorite) `),
            "isFavorite",
          ],
        ],
        include: [
          {
            model: db.DetailList,
            include: {
              model: db.RecipeList,
              attributes: ["name"],
            },
            attributes: ["recipeListId"],
          },
          {
            model: db.User,
            attributes: [
              "fullName",
              "avatar",
              "userId",
            ],
          },
        ],
      });
      const user = await db.User.findByPk(userId);
      if (recipe && recipe.length > 0) {
        recipe.map((item) => {
          if(item.dataValues.userId === userId) {
            item.dataValues.isMyRecipe = true
          } else {
            item.dataValues.isMyRecipe = false
          }
          item.dataValues.DetailLists.map((item) => {
            item.dataValues.name = item.dataValues.RecipeList.dataValues.name;
            delete item.dataValues["RecipeList"];
            return item;
          });
        });
        res.status(200).json({
          success: true,
          message: SUCCESS_GET_DATA,
          data: recipe,
        });
        return;
      }

      res.status(432).json({
        success: true,
        message: RECIPE_NOT_FOUND,
        data: '',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error,
        data: "",
      });
    }
  };

  getRecipeByUserId = async (req, res) => {
    try {
      const userId = req.params.userId;
      const userId1 = req.userId;
      const recipe = await db.Recipe.findAll({
        where: {
          [Op.and]: [
            {
              userId: userId,
            },
            {
              status: "CK",
            },
          ],
        },
        order: [["date", "DESC"]],
        attributes: [
          "userId",
          "recipeId",
          "recipeName",
          "date",
          "numberOfLikes",
          "image",
          "status",
          [
            sequelize.literal(`(SELECT CASE WHEN EXISTS 
              (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId1}) 
              THEN True ELSE False end isFavorite) `),
            "isFavorite",
          ],
        ],
        include: [
          {
            model: db.DetailList,
            include: {
              model: db.RecipeList,
              attributes: ["name"],
            },
            attributes: ["recipeListId"],
          },
          {
            model: db.User,
            attributes: [
              "fullName",
              "avatar",
              "userId",
              [
                sequelize.literal(` (SELECT CASE WHEN EXISTS 
                  (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId1}) 
                  then True else False end isFollow) `),
                "isFollow",
              ],
            ],
          },
        ],
      });
      const user = await db.User.findByPk(userId);
      if (recipe && recipe.length > 0) {
        recipe.map((item) => {
          if(item.dataValues.userId === userId1) {
            item.dataValues.isMyRecipe = true
          } else {
            item.dataValues.isMyRecipe = false
          }
          item.dataValues.DetailLists.map((item) => {
            item.dataValues.name = item.dataValues.RecipeList.dataValues.name;
            delete item.dataValues["RecipeList"];
            return item;
          });
        });
        const newData = { user, recipe };
        res.status(200).json({
          success: true,
          message: SUCCESS_GET_DATA,
          data: recipe,
        });
        return;
      }

      res.status(432).json({
        success: true,
        message: RECIPE_NOT_FOUND,
        data: '',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error,
        data: "",
      });
    }
  };

  searchRecipe = async (req, res) => {
    try {
      // http://localhost:8080/api/v1/recipe/search?q=mì
      const { q } = req.query;
      const userId = req.userId;
      let recipe = await db.Recipe.findAll({
        include: {
          model: db.User,
          attributes: [
            "fullName",
            "avatar",
            "userId",
            [
              sequelize.literal(` (SELECT CASE WHEN EXISTS 
                (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                then True else False end isFollow) `),
              "isFollow",
            ],
          ],
        },
        attributes: [
          "userId",
          "recipeId",
          "recipeName",
          "date",
          "numberOfLikes",
          "image",
          "status",
          [
            sequelize.literal(`(SELECT CASE WHEN EXISTS 
              (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
              THEN True ELSE False end isFavorite) `),
            "isFavorite",
          ],
        ],
        where: {
          [Op.and]: [
            {
              recipeName: {
                [Op.iLike]: `%${q}%`,
              },
            },
            {
              status: "CK",
            },
          ],
        },
      });

      if (recipe && recipe.length > 0) {
        recipe.map((item) => {
          if(item.dataValues.userId === userId) {
            item.dataValues.isMyRecipe = true
          } else {
            item.dataValues.isMyRecipe = false
          }
        });
        res.status(200).json({
          success: true,
          message: SUCCESS_GET_DATA,
          data: recipe,
        });
        return;
      }

      res.status(432).json({
        success: false,
        message: RECIPE_NOT_FOUND,
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  getRecipeFavorite = async (req, res) => {
    try {
      const userId = req.userId;
      let recipeFavorite = await db.Favorite.findAll({
        where: {
          userId: userId,
        },
        attributes: ["recipeId"],
      });
      let recipeId = recipeFavorite.map((item) => item.dataValues.recipeId);
      let recipe = await db.Recipe.findAll({
        where: {
          recipeId: {
            [Op.or]: [recipeId],
          },
        },
        include: {
          model: db.User,
          attributes: [
            "userId",
            "fullName",
            "avatar",
            [
              sequelize.literal(` (SELECT CASE WHEN EXISTS 
                (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                then True else False end isFollow) `),
              "isFollow",
            ],
          ],
        },
        attributes: [
          "userId",
          "recipeId",
          "recipeName",
          "date",
          "numberOfLikes",
          "image",
          "status",
          [
            sequelize.literal(`(SELECT CASE WHEN EXISTS 
              (SELECT * FROM "Favorite" WHERE "recipeId" = "Recipe"."recipeId" and "userId" = ${userId}) 
              THEN True ELSE False end isFavorite) `),
            "isFavorite",
          ],
        ],
      });
      if (recipe && recipe.length > 0) {
        recipe.map((item) => {
          if(item.dataValues.userId === userId) {
            item.dataValues.isMyRecipe = true
          } else {
            item.dataValues.isMyRecipe = false
          }
        });
        res.status(200).json({
          success: true,
          message: SUCCESS_SEARCH,
          data: recipe,
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: RECIPE_NOT_FOUND,
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };
}

module.exports = new recipeController();
