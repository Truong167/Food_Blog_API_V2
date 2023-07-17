'use strict';
const {
  Model
} = require('sequelize');
const {formatDate} = require('../middlewares/utils/formatDate');
module.exports = (sequelize, DataTypes) => {
  class DetailList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DetailList.belongsTo(models.Recipe, {foreignKey: 'recipeId'})
      DetailList.belongsTo(models.RecipeList, {foreignKey: 'recipeListId'})
    }
  }
  DetailList.init({
    recipeListId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    recipeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    date: {
      type: DataTypes.DATE,
      get: function() {
        return formatDate(this.getDataValue("date"))
      }
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'DetailList',
  });
  return DetailList;
};