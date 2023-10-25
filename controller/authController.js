const bcrypt = require("bcryptjs");
const db = require("../models/index");
const {
  checkEmailExists,
  validateEmail,
  validatePassword,
  checkAccountExists,
} = require("../middlewares/validator");
const moment = require("moment");
const { sequelize } = require("../models/index");
const jwt = require("jsonwebtoken");
const mailer = require("../middlewares/utils/mailer");
const OtpGenerator = require("otp-generator");
const { formatDate } = require("../middlewares/utils/formatDate");
const {
  FULL_NAME_BLANK_ERROR,
  EMAIL_BLANK_ERROR,
  ACCOUNT_BLANK_ERROR,
  PASSWORD_BLANK_ERROR,
  CONFIRM_PASSWORD_BLANK_ERROR,
  EMAIL_FORMAT_ERROR,
  EMAIL_UNIQUE_ERROR,
  ACCOUNT_UNIQUE_ERROR,
  PASSWORD_FORMAT_ERROR,
  MATCH_PASSWORD_ERROR,
  SUCCESS_REGISTER,
  INTERNAL_ERROR,
  ACCOUNT_EXIST_ERROR,
  WRONG_PASSWORD_ERROR,
  SUCCESS_LOGIN,
} = require("../contants/error-code");
require("dotenv").config();

class authController {
  handleCheckLogin = async (req, res) => {
    try {
      const user = await db.User.findByPk(req.userId, {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!user)
        return res
          .status(400)
          .json({ success: false, message: "User not found", data: "" });
      res
        .status(200)
        .json({ success: true, message: "Successfully", data: user });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  handleRegister = async (req, res) => {
    const { fullName, email, accountName, password, password2 } = req.body;

    const prm0 = new Promise((resolve, rejects) => {
      let x = checkEmailExists(email);
      resolve(x);
    });
    const prm1 = new Promise((resolve, rejects) => {
      let x = checkAccountExists(accountName);
      resolve(x);
    });
    let x = await Promise.all([prm0, prm1]);
    let [emailCheck, accountCheck] = [...x];
    if (!fullName) {
      return res.status(418).json({
        success: false,
        message: FULL_NAME_BLANK_ERROR,
        data: "",
      });
    }
    if (!email) {
      return res.status(418).json({
        success: false,
        message: EMAIL_BLANK_ERROR,
        data: "",
      });
    }
    if (!accountName) {
      return res.status(418).json({
        success: false,
        message: ACCOUNT_BLANK_ERROR,
        data: "",
      });
    }
    if (!password) {
      return res.status(418).json({
        success: false,
        message: PASSWORD_BLANK_ERROR,
        data: "",
      });
    }
    if (!password2) {
      return res.status(418).json({
        success: false,
        message: CONFIRM_PASSWORD_BLANK_ERROR,
        data: "",
      });
    }
    if (!validateEmail(email)) {
      return res.status(421).json({
        success: false,
        message: EMAIL_FORMAT_ERROR,
        data: "",
      });
    }
    if (emailCheck) {
      return res.status(422).json({
        success: false,
        message: EMAIL_UNIQUE_ERROR,
        data: "",
      });
    }
    if (accountCheck) {
      return res.status(423).json({
        success: false,
        message: ACCOUNT_UNIQUE_ERROR,
        data: "",
      });
    }
    if (!validatePassword(password)) {
      return res.status(420).json({
        success: false,
        message: PASSWORD_FORMAT_ERROR,
        data: "",
      });
    }
    if (password != password2) {
      return res.status(419).json({
        success: false,
        message: MATCH_PASSWORD_ERROR,
        data: "",
      });
    }
    try {
      const result = await sequelize.transaction(async (t) => {
        let user = await db.User.create(
          {
            fullName: fullName,
            email: email,
          },
          { transaction: t }
        );
        await db.Account.create(
          {
            accountName: accountName,
            password: bcrypt.hashSync(password, 10),
            userId: user.userId,
          },
          { transaction: t }
        );
        return user;
      });

      // const accessToken = jwt.sign({userId: result.user.userId}, process.env.ACCESS_TOKEN_SECRET)

      res.status(201).json({
        success: true,
        message: SUCCESS_REGISTER,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: INTERNAL_ERROR,
        data: "",
      });
    }
  };

  handleLogin = async (req, res) => {
    const { accountName, password } = req.body;

    if (!accountName) {
      return res.status(418).json({
        success: false,
        message: ACCOUNT_BLANK_ERROR,
        data: "",
      });
    }
    if(!password) {
        return res.status(418).json({
            success: false,
            message: PASSWORD_BLANK_ERROR,
            data: "",
          });
    }
    try {
      let account = await db.Account.findByPk(accountName);
      if (!account)
        return res.status(424).json({
          success: false,
          message: ACCOUNT_EXIST_ERROR,
          data: "",
        });
      const pass = await bcrypt.compare(password, account.password);
      if (!pass)
        return res.status(425).json({
          success: false,
          message: WRONG_PASSWORD_ERROR,
          data: "",
        });

      const accessToken = jwt.sign(
        { userId: account.userId },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "365d",
        }
      );
      res.status(200).json({
        success: true,
        message: SUCCESS_LOGIN,
        data: accessToken,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: INTERNAL_ERROR,
        data: "",
      });
    }
  };

  handleChangePassword = async (req, res) => {
    let {userId} = req
    let { oldPassword, newPassword, checkPassword } = req.body;
    try {
      let account = await db.Account.findOne({
        where: {
          userId: userId
        }
      });
      if (!account) {
        return res.status(424).json({
          success: false,
          message: "Account does not exist",
          data: "",
        });
      }
      const pass = await bcrypt.compare(oldPassword, account.password);
      if (!pass)
        return res.status(425).json({
          success: false,
          message: WRONG_PASSWORD_ERROR,
          data: "",
        });

      if (!validatePassword(newPassword)) {
        return res.status(420).json({
          success: false,
          message:
            "Your password must be at least 6 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character.",
          data: "",
        });
      }
      if (newPassword != checkPassword) {
        return res.status(419).json({
          success: false,
          message: "The entered passwords do not match",
          data: "",
        });
      }


      account.password = bcrypt.hashSync(newPassword, 10);
      await account.save();
      res.status(200).json({
        success: true,
        message: "Successfully change password",
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

  sendOtp = async (req, res) => {
    try {
      const { accountName, subject } = req.body;
      let account = await db.Account.findByPk(accountName);
      let expire = new Date();
      expire.setMinutes(expire.getMinutes() + 2);
      if (!account) {
        return res.status(424).json({
          success: false,
          message: "Account does not exist",
          data: "",
        });
      }
      let user = await db.User.findByPk(account.userId);
      const otpGenerator = OtpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      let data = [
        {
          email: user.email,
          // value: bcrypt.hashSync(otpGenerator, 10),
          value: otpGenerator,
          duration: expire,
        },
      ];
      let otp = await db.Otp.bulkCreate(data, {
        updateOnDuplicate: ["email", "value", "duration"],
      });
      // Thực hiện gửi email
      await mailer.sendMail(user.email, subject, otpGenerator);
      // Quá trình gửi email thành công thì gửi về thông báo success cho người dùng
      res.status(200).json({
        success: true,
        message: "Successfully send otp",
        data: otp[0].duration,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: "",
      });
    }
  };

  forgotPassword = async (req, res) => {
    let { userId } = req;
    let { newPassword, checkPassword, otp } = req.body;
    try {
      const currentTime1 = new Date();
      let account = await db.Account.findOne({
        where: {
          userId: userId,
        },
      });
      let user = await db.User.findByPk(userId);
      let checkOtp = await db.Otp.findByPk(user.email);

      if (!checkOtp)
        return res.status(449).json({
          success: false,
          message: "Invalid OTP",
          data: "",
        });
      if (!bcrypt.compareSync(otp, checkOtp.value))
        return res.status(450).json({
          success: false,
          message: "Incorrect OTP",
          data: "",
        });
      let dateFormat = "DD-MM-YYYY HH:mm:ss";
      let expireTime = moment(checkOtp.duration, dateFormat).toDate();
      let currentTime = formatDate(currentTime1);
      let temp = moment(currentTime, dateFormat).toDate();
      if (temp.getTime() > expireTime.getTime()) {
        return res.status(451).json({
          success: false,
          message: "OTP expired",
          data: "",
        });
      }
      if (!account) {
        return res.status(424).json({
          success: false,
          message: "Account does not exist",
          data: "",
        });
      }
      const pass = await bcrypt.compare(currentPassword, account.password);
      if (!pass) {
        return res.status(425).json({
          success: false,
          message: "Password do not match",
          data: "",
        });
      }
      if (!validatePassword(newPassword)) {
        return res.status(420).json({
          success: false,
          message:
            "Your password must be at least 6 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character.",
          data: "",
        });
      }
      if (newPassword != checkPassword) {
        return res.status(419).json({
          success: false,
          message: "The entered passwords do not match",
          data: "",
        });
      }

      account.password = bcrypt.hashSync(newPassword, 10);
      await account.save();
      res.status(200).json({
        success: true,
        message: "Successfully change password",
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

module.exports = new authController();
