'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DetailIngredient', {
      ingredientId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(128),
        references: {
          model: 'Ingredient',
          key: 'ingredientId'
        }
      },
      recipeId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Recipe',
          key: 'recipeId'
        }
      },
      amount: {
        allowNull: false,
        type: Sequelize.STRING(20),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DetailIngredient');
  }
};