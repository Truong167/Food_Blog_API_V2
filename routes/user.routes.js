const express = require('express')

const router = express.Router()
const userController = require('../controller/userController')


// http://localhost:8080/api/v1/user

router.get('/getAllUser', userController.getAllUser)
router.get('/getUser/:id', userController.getUserById)
router.get('/getUser1/:id', userController.getUserById1)
router.get('/getCurrentLocation', userController.getCurrentLocation)
router.get('/getCurrentLocationAllUser', userController.getCurrentLocationAllUser)



router.get('/getUserFollowing/:userId', userController.getUserFollowing)
router.get('/getUserFollow/:userId', userController.getUserFollow)
router.get('/searchUserByName', userController.searchUserByName)
router.get('/searchUserByEmail', userController.searchUserByEmail)


router.put('/update', userController.handleUpdateUser)
router.put('/updateCurrentLocation', userController.updateCurrentLocation)

router.delete('/deleteCurrentLocation', userController.deleteCurrentLocation)






module.exports = router