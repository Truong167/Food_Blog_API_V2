const express = require('express')

const router = express.Router()
const stepController = require('../controller/stepController')


router.get("/deleteStep/:recipeId/:stepId", stepController.handleDeleteStep)
router.get("/getAllStep", stepController.getAllStep)

router.get("/", stepController.index)

module.exports = router