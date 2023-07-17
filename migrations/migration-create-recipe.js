'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Recipe', {
      recipeId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      recipeName: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(5),
        validate: {
          isIn: [['RT', 'CK']],
        },
        allowNull: false
      },
      amount: {
        type: Sequelize.INTEGER,
        validate: {
          min: 1,
        },
        allowNull: false
      },
      preparationTime: {
        type: Sequelize.INTEGER,
        validate: {
          min: 1,
        },
        allowNull: false
      },
      cookingTime: {
        type: Sequelize.INTEGER,
        validate: {
          min: 1,
        },
        allowNull: false
      },
      numberOfLikes: {
        type: Sequelize.INTEGER,
        validate: {
          min: 0,
        },
        allowNull: false,
        defaultValue: 0
      },
      image: {
        type: Sequelize.STRING(128),
      },
      description: {
        type: Sequelize.STRING(128)
      },
      video: {
        type: Sequelize.STRING(256)
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'User',
          key: 'userId'
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
    }).

    then(() => queryInterface.addConstraint('Recipe', {
      fields: ['status'],
      type: 'check',
      where: {
        status: ['RT', 'CK']
      }
    })).

    then(() => queryInterface.addConstraint('Recipe', {
      fields: ['amount'],
      type: 'check',
      where: {
        amount: {
          [Sequelize.Op.gte]: 1
        }
      }
    })).

    then(() => queryInterface.addConstraint('Recipe', {
      fields: ['preparationTime'],
      type: 'check',
      where: {
        preparationTime: {
          [Sequelize.Op.gte]: 1
        }
      }
    })).

    then(() => queryInterface.addConstraint('Recipe', {
      fields: ['cookingTime'],
      type: 'check',
      where: {
        cookingTime: {
          [Sequelize.Op.gte]: 1
        }
      }
    }))
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Recipe');
  }
};