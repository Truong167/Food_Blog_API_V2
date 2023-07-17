'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Month extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Month.belongsTo(models.Season, {foreignKey: 'seasonId'})
    }
  }
  Month.init({
    monthId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    seasonId: DataTypes.INTEGER,
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Month',
  });
  return Month;
};