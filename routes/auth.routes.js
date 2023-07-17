const express = require('express')

const router = express.Router()
const authController = require('../controller/authController')
const verifyToken = require('../middlewares/auth')


// http://localhost:8080/api/v1/auth


router.get('/', verifyToken, authController.handleCheckLogin)
router.put('/changePassword', authController.handleChangePassword)
router.post('/sendOtp', authController.sendOtp)
router.post('/register', authController.handleRegister)
router.post('/login', authController.handleLogin)



module.exports = router