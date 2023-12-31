'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Comment', {
      commentId: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'User',
          key: 'userId',
        }
      },
      recipeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Recipe',
          key: 'recipeId',
        }
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      comment: {
        type: Sequelize.STRING(128),
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
    await queryInterface.dropTable('Comment');
  }
};