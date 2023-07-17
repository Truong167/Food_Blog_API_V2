'use strict';
const {
  Model
} = require('sequelize');
const {formatDate} = require('../middlewares/utils/formatDate');
module.exports = (sequelize, DataTypes) => {
  class RecipeList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RecipeList.hasMany(models.DetailList, {foreignKey: 'recipeListId'})
      RecipeList.belongsTo(models.User, {foreignKey: 'userId'})
    }
  }
  RecipeList.init({
    recipeListId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: DataTypes.STRING,
    date: {
      type:DataTypes.DATE,
      get: function() {
        return formatDate(this.getDataValue('date'))
      }
    },
    userId: DataTypes.INTEGER,
    image: DataTypes.STRING
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'RecipeList',
  });
  return RecipeList;
};