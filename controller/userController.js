const db = require("../models/index");
let multerConfig = require("../middlewares/utils/multerConfig");

const { checkEmailExists } = require("../middlewares/validator");
const { sequelize } = require("../models/index");
const { Op } = require("sequelize");
require("dotenv").config();
const fs = require("fs");

class userController {
  getAllUser = async (req, res) => {
    try {
      let data = await db.User.findAll();
      res.json({
        success: true,
        message: "Successfully get data",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  getUserById = async (req, res) => {
    try {
      let { userId } = req;
      let { id } = req.params;
      console.log(typeof id, typeof userId)
      let user = await db.User.findByPk(id, {
        attributes: {
          exclude: ["dateUpdatedRecipe", "createdAt", "updatedAt"],
          include: [
            [
              sequelize.literal(` (SELECT CASE WHEN EXISTS 
                        (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                        then True else False end isFollow) `),
              "isFollow",
            ],
            (userId === parseInt(id) ?
            [
              sequelize.literal(
                ` (Select count(*) from "Recipe" where "userId" = ${id}) `
              ),
              "countRecipe",
            ]
            :
            [
              sequelize.literal(
                ` (Select count(*) from "Recipe" where "userId" = ${id} and "status" = 'CK') `
              ),
              "countRecipe",
            ])
            ,
            [
              sequelize.literal(
                ` (Select count(*) from "Follow" where "userIdFollow" = ${id}) `
              ),
              "countFollowing",
            ],
            [
              sequelize.literal(
                ` (Select count(*) from "Follow" where "userIdFollowed" = ${id}) `
              ),
              "countFollowed",
            ],
          ],
        },
      });
      if (user) {
        res.status(200).json({
          success: true,
          message: "Successfully get data",
          data: user,
        });
        return;
      }
      res.status(426).json({
        success: false,
        message: "User not found",
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  handleUpdateUser = async (req, res) => {
    const userId = req.userId;
    const { fullName, dateOfBirth, address, email, introduce, avatar } =
      req.body;
    if (!fullName || !dateOfBirth || !address || !email) {
      res.status(418).json({
        success: false,
        message: "Please provide all required fields",
        data: "",
      });
      return;
    }
    const emailCheck = await checkEmailExists(email, userId);
    if (emailCheck) {
      res.status(422).json({
        success: false,
        message: "Email already exists",
        data: "",
      });
      return;
    }

    try {
      let user = await db.User.findByPk(userId);
      let oldImage = user.avatar;
      if (user) {
        user.fullName = fullName;
        user.dateOfBirth = dateOfBirth;
        user.address = address;
        user.email = email;
        user.avatar = avatar
        user.introduce = introduce ? introduce : "";

        let updated = await user.save();

        res.status(200).json({
          success: true,
          message: "Successfully updated",
          data: updated,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: "User not found",
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  getUserFollowing = async (req, res) => {
    const { userId } = req.params;
    const userId1 = req.userId;
    try {
      let userFollow = await db.Follow.findAll({
        where: {
          userIdFollow: userId,
        },
        attributes: ["userIdFollowed"],
      });
      let count = await db.Follow.count({
        where: {
          userIdFollow: userId,
        },
      });
      if (userFollow && userFollow.length > 0) {
        let newFollowerData = userFollow.map(
          (item) => item.dataValues.userIdFollowed
        );
        let users = await db.User.findAll({
          where: {
            userId: {
              [Op.or]: [newFollowerData],
            },
          },
          attributes: [
            "userId",
            "fullName",
            "avatar",
            "email",
            [
              sequelize.literal(` (SELECT CASE WHEN EXISTS 
                            (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId1}) 
                            then True else False end isFollow) `),
              "isFollow",
            ],
          ],
        });
        const newData = { users, count };
        res.status(200).json({
          success: true,
          message: "Successfully get data",
          data: newData,
        });
        return;
      }
      res.status(441).json({
        success: false,
        message: "User do not follow anyone",
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error,
        data: "",
      });
    }
  };

  getUserFollow = async (req, res) => {
    const { userId } = req.params;
    const userId1 = req.userId;
    try {
      let userFollow = await db.Follow.findAll({
        where: {
          userIdFollowed: userId,
        },
        attributes: ["userIdFollow"],
      });
      let count = await db.Follow.count({
        where: {
          userIdFollowed: userId,
        },
      });
      if (userFollow && userFollow.length > 0) {
        let newFollowerData = userFollow.map(
          (item) => item.dataValues.userIdFollow
        );
        let users = await db.User.findAll({
          where: {
            userId: {
              [Op.or]: [newFollowerData],
            },
          },
          attributes: [
            "userId",
            "fullName",
            "avatar",
            "email",
            [
              sequelize.literal(` (SELECT CASE WHEN EXISTS 
                            (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId1}) 
                            then True else False end isFollow) `),
              "isFollow",
            ],
          ],
        });
        const newData = { users, count };
        res.status(200).json({
          success: true,
          message: "Successfully get data",
          data: newData,
        });
        return;
      }
      res.status(442).json({
        success: false,
        message: "No one is following this user",
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error,
        data: "",
      });
    }
  };

  searchUserByName = async (req, res) => {
    try {
      const { q } = req.query;
      const { userId } = req;
      let user = await db.User.findAll({
        where: {
          fullName: {
            [Op.iLike]: `%${q}%`,
          },
        },
        attributes: [
          "userId",
          "fullName",
          "avatar",
          "email",
          [
            sequelize.literal(` (SELECT CASE WHEN EXISTS 
                        (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                        then True else False end isFollow) `),
            "isFollow",
          ],
        ],
      });

      if (user && user.length > 0) {
        res.status(200).json({
          success: true,
          message: "Successfully search",
          data: user,
        });
        return;
      }

      res.status(426).json({
        success: false,
        message: "User not found",
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  searchUserByEmail = async (req, res) => {
    try {
      const { q } = req.query;
      const { userId } = req;
      let user = await db.User.findAll({
        where: {
          email: {
            [Op.iLike]: `%${q}%`,
          },
        },
        attributes: [
          "userId",
          "fullName",
          "avatar",
          "email",
          [
            sequelize.literal(` (SELECT CASE WHEN EXISTS 
                        (Select * from "Follow" where "userIdFollowed" = "User"."userId" and "userIdFollow" = ${userId}) 
                        then True else False end isFollow) `),
            "isFollow",
          ],
        ],
      });

      if (user && user.length > 0) {
        res.status(200).json({
          success: true,
          message: "Successfully search",
          data: user,
        });
        return;
      }

      res.status(426).json({
        success: false,
        message: "User not found",
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  getCurrentLocation = async (req, res) => {
    let { userId } = req;
    try {
      let location = await db.User.findByPk(userId, {
        attributes: [
          "userId",
          "fullName",
          "email",
          "latitude",
          "longtitude",
          "currentLocation",
          "locationLastUpdated",
          "avatar",
        ],
      });

      if (location.currentLocation) {
        return res.status(200).json({
          success: true,
          message: "Successfully get current location",
          data: location,
        });
      }
      res.status(455).json({
        success: false,
        message: "Can not get current location",
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  getCurrentLocationAllUser = async (req, res) => {
    try {
      let location = await db.User.findAll({
        attributes: [
          "userId",
          "fullName",
          "email",
          "latitude",
          "longtitude",
          "currentLocation",
          "locationLastUpdated",
          "avatar",
        ],
      });

      if (location && location.length > 0) {
        return res.status(200).json({
          success: true,
          message: "Successfully get current location",
          data: location,
        });
      }
      res.status(455).json({
        success: false,
        message: "Can not get current location",
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  updateCurrentLocation = async (req, res) => {
    let { userId } = req;
    let { currentLocation, latitude, longtitude } = req.body;
    try {
      let user = await db.User.findByPk(userId);
      if (user) {
        user.currentLocation = currentLocation;
        user.latitude = latitude;
        user.longtitude = longtitude;
        user.locationLastUpdated = Date.now();
        await user.save();
        return res.status(200).json({
          success: true,
          message: "Successfully updated",
          data: "",
        });
      }

      res.status(426).json({
        success: false,
        message: "User not found",
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  deleteCurrentLocation = async (req, res) => {
    let { userId } = req;
    try {
      let user = await db.User.findByPk(userId);
      if (user) {
        user.currentLocation = null;
        user.latitude = null;
        user.longtitude = null;
        user.locationLastUpdated = Date.now();
        await user.save();
        return res.status(200).json({
          success: true,
          message: "Successfully delete",
          data: "",
        });
      }

      res.status(426).json({
        success: false,
        message: "User not found",
        data: "",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };
}

module.exports = new userController();
