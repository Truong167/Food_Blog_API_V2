'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Step', {
      stepId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      image: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true
      },
      recipeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Recipe',
          key: 'recipeId',
        },
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Step');
  }
};