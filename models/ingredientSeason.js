'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class IngredientSeason extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      IngredientSeason.belongsTo(models.Ingredient, {foreignKey: 'ingredientId'})
      IngredientSeason.belongsTo(models.Season, {foreignKey: 'seasonId'})

      // define association here
    }
  }
  IngredientSeason.init({
    ingredientId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    seasonId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'IngredientSeason',
  });
  return IngredientSeason;
};