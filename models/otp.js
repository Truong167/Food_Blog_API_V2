'use strict';
const {
  Model
} = require('sequelize');
const {formatDate} = require('../middlewares/utils/formatDate');

module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

    }
  }
  Otp.init({
    email: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    value: DataTypes.STRING,
    duration: {
      type: DataTypes.DATE,
      get: function() {
        return formatDate(this.getDataValue('duration'))
      }
    },
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Otp',
  });
  
  return Otp;
};