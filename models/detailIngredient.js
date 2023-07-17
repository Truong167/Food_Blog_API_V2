'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DetailIngredient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DetailIngredient.belongsTo(models.Ingredient, {foreignKey: 'ingredientId'})
      DetailIngredient.belongsTo(models.Recipe, {foreignKey: 'recipeId'})

    }
  }
  DetailIngredient.init({
    recipeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    ingredientId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'DetailIngredient',
  });
  return DetailIngredient;
};