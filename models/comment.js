'use strict';
const {
  Model
} = require('sequelize');
const {formatDate} = require('../middlewares/utils/formatDate');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Comment.belongsTo(models.Recipe, {foreignKey: 'recipeId'})
      Comment.belongsTo(models.User, {foreignKey: 'userId'})

    }
  }
  Comment.init({
    commentId: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    userId: {
        type: DataTypes.INTEGER,
    },
    recipeId: {
        type: DataTypes.INTEGER,
    },
    date: {
      type: DataTypes.DATE,
      get: function() {
        return formatDate(this.getDataValue('date'))
      }
    },
    comment: DataTypes.STRING
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Comment'
  });
  return Comment;
};