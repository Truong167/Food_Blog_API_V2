'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Season extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Season.hasMany(models.IngredientSeason, {foreignKey: 'seasonId'})
      Season.hasMany(models.Month, {foreignKey: 'seasonId'})

    }
  }
  Season.init({
    seasonId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    nameOfSeason: DataTypes.STRING,
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Season',
  });
  return Season;
};