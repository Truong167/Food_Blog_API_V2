const { sequelize } = require("../models/index");
const db = require("../models/index");
const multerConfig = require("../middlewares/utils/multerConfig");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const fs = require("fs");
const { SUCCESS_GET_DATA, BLANK_FIELDS } = require("../contants/error-code/user");
const { RECIPE_LIST_NOT_FOUND, SUCCESS_CREATE_RECIPE_LIST, SUCCESS_CREATE_RECIPE, SUCCESS_DELETE_RECIPE } = require("../contants/error-code/recipeList");
const { RECIPE_NOT_FOUND } = require("../contants/error-code/recipe");


class recipeListController {
  getRecipeList = async (req, res) => {
    try {
      const userId = req.userId;
      const recipeList = await db.RecipeList.findAll({
        where: {
          userId: userId,
        },
        attributes: ["recipeListId", "name", "image"],
        order: [["date", "DESC"]],
      });
      if (recipeList && recipeList.length > 0) {
        res.status(200).json({
          success: true,
          message: SUCCESS_GET_DATA,
          data: recipeList,
        });
        return;
      }
      res.status(439).json({
        success: false,
        message: RECIPE_LIST_NOT_FOUND,
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

  handleCreateRecipeList = async (req, res) => {
    let { name } = req.body;
    if (!name) {
      res.status(418).json({
        success: false,
        message: BLANK_FIELDS,
        data: "",
      });
      return;
    }
    try {
      let userId = req.userId;
      const recipeList = await db.RecipeList.create({
        name: name,
        date: Date.now(),
        userId: userId,
      });
      res.status(200).json({
        success: true,
        message: SUCCESS_CREATE_RECIPE_LIST,
        data: recipeList,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  handleUpdateRecipeList = async (req, res) => {
    let { name } = req.body;
    if (!name) {
      res.status(418).json({
        success: false,
        message: BLANK_FIELDS,
        data: "",
      });
      return;
    }
    try {
      let { id } = req.params;
      let recipeList = await db.RecipeList.findByPk(id);
      if (recipeList) {
        recipeList.name = name;
        await recipeList.save();
        res.status(200).json({
          success: true,
          message: "Successfully updated recipe list",
          data: recipeList,
        });
        return;
      }
      res.status(433).json({
        success: false,
        message: "Recipe list not found",
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

  handleDeleteRecipeList = async (req, res) => {
    try {
      let { id } = req.params;
      const prm0 = new Promise((resolve, rejects) => {
        let x = db.DetailList.destroy({ where: { recipeListId: id } });
        resolve(x);
      });
      const prm1 = new Promise((resolve, rejects) => {
        let x = db.RecipeList.findByPk(id);
        resolve(x);
      });
      let x = await Promise.all([prm0, prm1]);
      let [detailList, recipeList] = [...x];
      // let detailList = await db.DetailList.findAll({where: {recipeListId: id}})
      // let recipeList = await db.RecipeList.findByPk(id)

      if (recipeList) {
        // recipeList.name = name
        // await detailList.destroy()
        await recipeList.destroy();

        res.status(200).json({
          success: true,
          message: "Successfully deleted recipe list",
          data: "",
        });
        return;
      }

      res.status(433).json({
        success: false,
        message: "Recipe list not found",
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
    try {
      let { recipeId } = req.params;
      let { recipeListDetail } = req.body;
      console.log(req.body);
      let recipe = await db.Recipe.findByPk(recipeId);
      let dtList = await db.DetailList.findAll({
        where: { recipeId: recipeId },
      });

      // Lọc những phần tử trong mảng dtList kh trùng với những phần từ trong recipeListDetail
      dtList = dtList.filter(
        ({ recipeListId: id1 }) =>
          !recipeListDetail.some(({ recipeListId: id2 }) => id2 === id1)
      );
      dtList = dtList.map((item) => {
        return item.dataValues.recipeListId;
      });
      recipeListDetail = recipeListDetail.map((item) => {
        item.recipeId = recipeId;
        item.date = Date.now();
        return item;
      });
      if (!recipe) {
        res.status(432).json({
          success: false,
          message: RECIPE_NOT_FOUND,
          data: "",
        });
      } else {
        const updateRecipe = await sequelize.transaction(async (t) => {
          if (dtList.length > 0) {
            await db.DetailList.destroy(
              {
                where: {
                  [Op.and]: [
                    {
                      recipeListId: {
                        [Op.or]: dtList,
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
            await db.DetailList.bulkCreate(
              recipeListDetail,
              {
                updateOnDuplicate: ["recipeListId", "recipeId"],
              },
              { transaction: t }
            );
          } else {
            await db.DetailList.bulkCreate(
              recipeListDetail,
              {
                updateOnDuplicate: ["recipeListId", "recipeId"],
              },
              { transaction: t }
            );
          }

          res.status(200).json({
            success: true,
            message: SUCCESS_CREATE_RECIPE,
            data: "",
          });
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
      let { recipeListId, recipeId } = req.params;
      let recipe = await db.DetailList.findOne({
        where: { recipeListId: recipeListId, recipeId: recipeId },
      });
      if (recipe) {
        let detailList = await recipe.destroy();
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

  getRecipe = async (req, res) => {
    try {
      let { userId } = req;
      let { recipeListId } = req.params;
      let dt = await db.DetailList.findAll({
        where: {
          recipeListId: recipeListId,
        },
      });

      dt = dt.map((item) => {
        return item.dataValues.recipeId;
      });
      if (dt.length == 0) {
        res.status(447).json({
          success: false,
          message: RECIPE_NOT_FOUND,
          data: "",
        });
        return;
      }
      let recipe = await db.Recipe.findAll({
        where: {
          [Op.and]: [
            {
              recipeId: {
                [Op.or]: dt,
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
          // {
          //     model: db.DetailList,
          //     include: {
          //         model: db.RecipeList,
          //         attributes: ["name"]
          //     },
          //     attributes: ["recipeListId"]
          // },
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
        message: RECIPE_LIST_NOT_FOUND,
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

  getBookmarkList = async (req, res) => {
    try {
      const userId = req.userId;
      const recipeId = req.params.recipeId;
      const recipeList = await db.RecipeList.findAll({
        where: {
          userId: userId,
        },
        attributes: [
          "recipeListId",
          "name",
          [
            sequelize.literal(` (SELECT CASE WHEN EXISTS 
                    (Select * from "DetailList" where "recipeListId" = "RecipeList"."recipeListId" and "recipeId" = ${recipeId}) 
                    then True else False end isBookmarked) `),
            "isBookmarked",
          ],
        ],
      });
      if (recipeList.length > 0) {
        return res.status(200).json({
          success: true,
          message: SUCCESS_GET_DATA,
          data: recipeList,
        });
      }

      return res.status(400).json({
        success: false,
        message: RECIPE_LIST_NOT_FOUND,
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

module.exports = new recipeListController();
