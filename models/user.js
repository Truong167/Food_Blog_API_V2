'use strict';
const {
  Model
} = require('sequelize');
const {formatDate} = require('../middlewares/utils/formatDate')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // User.belongsTo(models.Account, {foreignKey: 'userId'})
      User.hasMany(models.Recipe, {foreignKey: 'userId'})
      // User.belongsToMany(models.User, {through: models.Follow, foreignKey: 'userIdFollow', as: 'follow'})
      // User.belongsToMany(models.User, {through: models.Follow, foreignKey: 'userIdFollowed', as: 'followed'})
      User.hasMany(models.Follow, {foreignKey: 'userIdFollow'})
      User.hasMany(models.Follow, {foreignKey: 'userIdFollowed'})
      User.hasMany(models.RecipeList, {foreignKey: 'userId'})
      User.hasMany(models.Comment, {foreignKey: 'userId'})
      User.hasMany(models.Favorite, {foreignKey: 'userId'})


    }
  }
  User.init({
    userId: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    fullName: DataTypes.STRING,
    dateOfBirth: {
      type: DataTypes.DATE,
      get: function() {
        return formatDate(this.getDataValue('dateOfBirth'))
      }
    },
    address: DataTypes.STRING,
    email: DataTypes.STRING,
    introduce: DataTypes.STRING,
    dateUpdatedRecipe: {
      type: DataTypes.DATE,
      get: function() {
        return formatDate(this.getDataValue('dateUpdatedRecipe'))
      }
    },
    avatar: DataTypes.STRING,
    currentLocation: DataTypes.STRING,
    latitude: DataTypes.DOUBLE,
    longtitude: DataTypes.DOUBLE,
    locationLastUpdated: {
      type: DataTypes.DATE,
      get: function() {
        return formatDate(this.getDataValue('locationLastUpdated'))
      }
    },

  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'User',
  });
  return User;
};