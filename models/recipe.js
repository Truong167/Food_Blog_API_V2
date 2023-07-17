'use strict';
const {
  Model
} = require('sequelize');
const {formatDate} = require('../middlewares/utils/formatDate');
module.exports = (sequelize, DataTypes) => {
  class Recipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Recipe.belongsTo(models.User, {foreignKey: 'userId'});
      Recipe.hasMany(models.Step, {foreignKey: 'recipeId'});
      Recipe.hasMany(models.DetailIngredient, {foreignKey: 'recipeId'});
      Recipe.hasMany(models.DetailList, {foreignKey: 'recipeId'});
      Recipe.hasMany(models.Favorite, {foreignKey: 'recipeId'});
      Recipe.hasMany(models.Comment, {foreignKey: 'recipeId'});
      // Recipe.belongsToMany(models.IngredientTag, {through: models.RecipeTag})
    }
  }
  Recipe.init({
    recipeId: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    recipeName: DataTypes.STRING,
    date: {
      type: DataTypes.DATE,
      get: function() {
        return formatDate(this.getDataValue('date'))
      }
    },
    status: {
        type: DataTypes.STRING,
        validate: {
            isIn: [['RT', 'CK']],
        }
    },
    amount: {
        type: DataTypes.INTEGER,
        validate: {
            min: 1,
        }
    },
    preparationTime: {
        type: DataTypes.INTEGER,
        validate: {
            min: 1,
        }
    },
    cookingTime: {
        type: DataTypes.INTEGER,
        validate: {
            min: 1,
        }
    },
    numberOfLikes: {
        type: DataTypes.INTEGER,
        validate: {
            min: 0
        }
    },
    image: DataTypes.STRING,
    description: DataTypes.STRING,
    video: DataTypes.STRING,
    userId: DataTypes.INTEGER,
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Recipe',
  });
  return Recipe;
};