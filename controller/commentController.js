const { COMMENT_NOT_FOUND, SUCCESS_ADD_COMMENT, SUCCESS_UPDATE_COMMENT, SUCCESS_DELETE_COMMENT } = require("../contants/error-code/comment");
const { RECIPE_NOT_FOUND } = require("../contants/error-code/recipe");
const { SUCCESS_GET_DATA, BLANK_FIELDS } = require("../contants/error-code/user");
const { sequelize } = require("../models/index");

const db = require("../models/index");

class commentController {
  index = (req, res) => {
    res.send("comments");
  };

  getCommentOfRecipe = async (req, res) => {
    try {
      const userId = req.userId;
      const { recipeId } = req.params;
      let recipe = await db.Recipe.findByPk(recipeId);
      if (recipe) {
        let comment = await db.Comment.findAll({
          where: {
            recipeId: recipeId,
          },
          include: {
            model: db.User,
            attributes: ["fullName", "avatar"],
          },
          attributes:{
            exclude: ['createdAt', 'updatedAt']
          },
          order: [["date", "DESC"]],
        });

        comment.map(item => {
            if(item.dataValues.userId === userId){
                item.dataValues.isMyComment = true
            } else {
                item.dataValues.isMyComment = false
            }
            return item
        })
        if (comment && comment.length > 0) {
          let commentCount = await db.Comment.count({
            where: { recipeId: recipeId },
          });
          let myComment = await db.Comment.findOne({
            where: { userId: userId, recipeId: recipeId },
            include: {
              model: db.User,
              attributes: ["fullName", "avatar"],
            },
            attributes: { exclude: ["createdAt", "updatedAt"] },
          });
          let newData = { comment, commentCount: commentCount, myComment };
          return res.status(200).json({
            success: true,
            message: SUCCESS_GET_DATA,
            data: newData,
          });
        } else {
          return res.status(438).json({
            success: false,
            message: COMMENT_NOT_FOUND,
            data: "",
          });
        }
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

  handleCreateComment = async (req, res) => {
    try {
      let { recipeId } = req.params;
      let userId = req.userId;
      let { comment } = req.body;
      if (!comment) {
        return res.status(400).json({
          success: false,
          message: BLANK_FIELDS,
          data: "",
        });
      }
      let recipe = await db.Recipe.findByPk(recipeId);
      if (recipe) {
        let commentData = await db.Comment.create({
          userId: userId,
          recipeId: recipeId,
          date: Date.now(),
          comment: comment,
        });
        res.status(200).json({
          success: true,
          message: SUCCESS_ADD_COMMENT,
          data: commentData,
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

  handleUpdateComment = async (req, res) => {
    try {
      let { commentId } = req.params;
      let { comment } = req.body;
      let commentData = await db.Comment.findByPk(commentId);
      if (commentData) {
        commentData.comment = comment;
        let data = await commentData.save();
        res.status(200).json({
          success: true,
          message: SUCCESS_UPDATE_COMMENT,
          data: data,
        });
        return;
      }
      res.status(434).json({
        success: false,
        message: COMMENT_NOT_FOUND,
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

  handleDeleteComment = async (req, res) => {
    try {
      let { commentId } = req.params;
      let userId = req.userId;
      let comment = await db.Comment.findByPk(commentId)
      if (comment) {
        let commentData = await comment.destroy();
        res.status(200).json({
          success: true,
          message: SUCCESS_DELETE_COMMENT,
          data: commentData,
        });
        return;
      }
      res.status(434).json({
        success: false,
        message: COMMENT_NOT_FOUND,
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

module.exports = new commentController();
