const express = require('express')

const router = express.Router()
const adminController = require('../controller/adminController')
const verifyToken = require('../middlewares/auth')


// http://localhost:8080/api/v1/admin

router.get('/getStatisticalOfIngredient', adminController.statisticalOfIngredient)
router.get('/getStatisticalOfIngredient2', adminController.statisticalOfIngredient2)
router.get('/getInfor/:accountName', adminController.getInforAdmin)


router.get('/getStatisticalOfIngredient/:ingredientId', adminController.statisticalOfIngredient1)
router.get('/getIngredient/:ingredientId', adminController.getIngredient)


router.post('/login', adminController.handleLoginAdmin)
router.post('/createAccount', adminController.createAccount)

router.post('/createIngredient', adminController.createIngredient)

router.put('/updateIngredient/:ingredientId', adminController.updateIngredient)


router.delete('/deleteIngredient/:ingredientId', adminController.deleteIngredient)



module.exports = router