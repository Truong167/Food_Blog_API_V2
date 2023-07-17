const bcrypt = require('bcryptjs')
const db = require('../models/index')
const {
    checkEmailExists,
    validateEmail,
    validatePassword,
    checkAccountExists
} = require('../middlewares/validator')
const moment = require('moment')
const {sequelize} = require('../models/index')
const jwt = require('jsonwebtoken')
const mailer = require('../middlewares/utils/mailer')
const OtpGenerator = require('otp-generator')
const {formatDate} = require('../middlewares/utils/formatDate')
require('dotenv').config()

class authController {
    
    handleCheckLogin = async (req, res) => {
        try {
            const user = await db.User.findByPk(req.userId)
            if(!user) return res.status(400).json({success: false, message: 'User not found', data: ''})
            res.status(200).json({success: true, message: 'Successfully', data: user})
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
                data: ""
            })
        }
    }

    handleRegister = async (req, res) => {

        const { fullName, email, accountName, password, password2 } = req.body

        const prm0 = new Promise((resolve, rejects) => {
            let x = checkEmailExists(email)
            resolve(x)
        })
        const prm1 = new Promise((resolve, rejects) => {
            let x = checkAccountExists(accountName)
            resolve(x)
        })
        let x = await Promise.all([prm0, prm1])
        let [emailCheck, accountCheck] = [...x]
        if(!fullName || !email || !accountName || !password || !password2){
            res.status(418).json({
                success: false,
                message: 'Please provide all required fields',
                data: ""
            })
        } 
        else if(!validateEmail(email)){
            res.status(421).json({
                success: false,
                message: 'Email address has invalid format',
                data: ""
            })
        } 
        else if(emailCheck){
            res.status(422).json({
                success: false,
                message: 'Email already exists',
                data: ""
            })
        } 
        else if(accountCheck){
            res.status(423).json({
                success: false,
                message: 'Account already exists',
                data: ""
            })
        } 
        else if( password != password2){
            res.status(419).json({
                success: false,
                message: 'The entered passwords do not match',
                data: ""
            })
        } 
        else if(!validatePassword(password)){
            res.status(420).json({
                success: false,
                message:
                  'Your password must be at least 6 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character.',
                data: ""
              })
        } 
        else {
            try {
                const result = await sequelize.transaction(async t => {
                    let user = await db.User.create({
                        fullName: fullName,
                        email: email,
                    }, { transaction: t })
                    await db.Account.create({
                        accountName: accountName,
                        password: bcrypt.hashSync(password, 10),
                        userId: user.userId
                    }, { transaction: t })
                    return user
                })

                // const accessToken = jwt.sign({userId: result.user.userId}, process.env.ACCESS_TOKEN_SECRET)

                res.status(201).json({
                    success: true,
                    message: 'Successfully register',
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: error,
                    data: ""
                })
            }
        }
    }

    handleLogin = async (req, res) => {
        const { accountName, password } = req.body
        if(!accountName || !password) {
            res.status(418).json({
                success: false,
                message: 'Please all provide required fields',
                data: ""
            })
            return
        }
        try {
            let account = await db.Account.findByPk(accountName)
            if(!account)
            return res.status(424).json({
                success: false,
                message: 'Account does not exist',
                data: ""
            })
            const pass = await bcrypt.compare(password, account.password)
            if(!pass)
            return  res.status(425).json({
                success: false,
                message: 'Password do not match',
                data: ""
            })

            const accessToken = jwt.sign({userId: account.userId}, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '365d'
            })
            res.status(200).json({
                success: true,
                message: 'Successfully logged in',
                data: accessToken
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
                data: ""
            })
        }
    }

    

    handleChangePassword = async (req, res) => {
        let {accountName, newPassword, checkPassword, otp} = req.body
        try {
            const currentTime1 = new Date()
            let account = await db.Account.findByPk(accountName)

            if(!account){
                return res.status(424).json({
                    success: false,
                    message: 'Account does not exist',
                    data: ""
                })
            }
            let user = await db.User.findByPk(account.userId)
            let checkOtp = await db.Otp.findByPk(user.email)
            if(!validatePassword(newPassword)){
                return res.status(420).json({
                    success: false,
                    message:
                      'Your password must be at least 6 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character.',
                    data: ""
                  })
            }
            if( newPassword != checkPassword){
                return res.status(419).json({
                    success: false,
                    message: 'The entered passwords do not match',
                    data: ""
                })
            }
            // if (!bcrypt.compareSync(otp, checkOtp.value)) 
            //     return res.status(450).json({
            //         success: false,
            //         message: 'Incorrect OTP',
            //         data: ""
            //     })
            if (!checkOtp) 
                return res.status(449).json({
                    success: false,
                    message: 'Invalid OTP',
                    data: ""
                })
            if(otp !== checkOtp.value){
                return res.status(450).json({
                    success: false,
                    message: 'Incorrect OTP',
                    data: ""
                })
            }

            let dateFormat = "DD-MM-YYYY HH:mm:ss"
            let expireTime = moment(checkOtp.duration, dateFormat).toDate()
            let currentTime = formatDate(currentTime1)
            let temp = moment(currentTime, dateFormat).toDate()
            console.log(checkOtp.duration)
            console.log(currentTime)
            console.log(expireTime)
            console.log(temp)
            if (temp.getTime() > expireTime.getTime()) {
                return res.status(451).json({
                    success: false,
                    message: 'OTP expired',
                    data: ""
                })

            }
            

            account.password = bcrypt.hashSync(newPassword, 10)
            await account.save()
            res.status(200).json({
                success: true,
                message: 'Successfully change password',
                data: ''
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
                data: ""
            })
        }
    }

    sendOtp = async (req, res) => {
        try {
            const { accountName, subject } = req.body
            let account = await db.Account.findByPk(accountName)
            let expire = new Date()
            expire.setMinutes(expire.getMinutes() + 2)
            if(!account){
                return res.status(424).json({
                    success: false,
                    message: 'Account does not exist',
                    data: ""
                })
            }
            let user = await db.User.findByPk(account.userId)
            const otpGenerator = OtpGenerator.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
            })
            let data = [{
                email: user.email,
                // value: bcrypt.hashSync(otpGenerator, 10),
                value: otpGenerator,
                duration: expire
            }]
            let otp = await db.Otp.bulkCreate(data, {updateOnDuplicate: ["email", "value", "duration"]})
            // Thực hiện gửi email
            await mailer.sendMail(user.email, subject, otpGenerator)
            // Quá trình gửi email thành công thì gửi về thông báo success cho người dùng
            res.status(200).json({
                success: true,
                message: 'Successfully send otp',
                data: otp[0].duration
            })
          } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
                data: ""
            })
          }
    }

    forgotPassword = async (req, res) => {
        let {userId} = req
        let {newPassword, checkPassword, otp} = req.body
        try {
            const currentTime1 = new Date()
            let account = await db.Account.findOne({
                where: {
                    userId: userId
                }, 
            })
            let user = await db.User.findByPk(userId)
            let checkOtp = await db.Otp.findByPk(user.email)

            if (!checkOtp) 
                return res.status(449).json({
                    success: false,
                    message: 'Invalid OTP',
                    data: ""
                })
            if (!bcrypt.compareSync(otp, checkOtp.value)) 
                return res.status(450).json({
                    success: false,
                    message: 'Incorrect OTP',
                    data: ""
                })
                let dateFormat = "DD-MM-YYYY HH:mm:ss"
                let expireTime = moment(checkOtp.duration, dateFormat).toDate()
                let currentTime = formatDate(currentTime1)
                let temp = moment(currentTime, dateFormat).toDate()
                console.log(checkOtp.duration)
                console.log(currentTime)
                console.log(expireTime)
                console.log(temp)
                if (temp.getTime() > expireTime.getTime()) {
                    return res.status(451).json({
                        success: false,
                        message: 'OTP expired',
                        data: ""
                    })
    
                }
            if(!account){
                return res.status(424).json({
                    success: false,
                    message: 'Account does not exist',
                    data: ""
                })
            }
            const pass = await bcrypt.compare(currentPassword, account.password)
            if(!pass){
                return  res.status(425).json({
                    success: false,
                    message: 'Password do not match',
                    data: ""
                })
            }
            if(!validatePassword(newPassword)){
                return res.status(420).json({
                    success: false,
                    message:
                      'Your password must be at least 6 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character.',
                    data: ""
                  })
            }
            if( newPassword != checkPassword){
                return res.status(419).json({
                    success: false,
                    message: 'The entered passwords do not match',
                    data: ""
                })
            }

            account.password = bcrypt.hashSync(newPassword, 10)
            await account.save()
            res.status(200).json({
                success: true,
                message: 'Successfully change password',
                data: ''
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
                data: ""
            })
        }
    }
}

module.exports = new authController