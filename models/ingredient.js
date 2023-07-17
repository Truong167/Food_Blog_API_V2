'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ingredient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ingredient.hasMany(models.DetailIngredient, {foreignKey: 'ingredientId'});
      Ingredient.hasMany(models.IngredientSeason, {foreignKey: 'ingredientId'});
      // Ingredient.belongsToMany(models.Recipe, {through: models.RecipeTag})

    }
  }
  Ingredient.init({
    ingredientId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    image: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Ingredient',
  });
  return Ingredient;
};