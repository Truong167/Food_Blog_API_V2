'use strict';
const {
  Model
} = require('sequelize');
const {formatDate} = require('../middlewares/utils/formatDate');
module.exports = (sequelize, DataTypes) => {
  class Favorite extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Favorite.belongsTo(models.Recipe, {foreignKey: 'recipeId'})
      Favorite.belongsTo(models.User, {foreignKey: 'userId'})

    }
  }
  Favorite.init({
    userId: {
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
        return formatDate(this.getDataValue('date'))
      }
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Favorite'
  });
  return Favorite;
};