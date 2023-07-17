const express = require('express')

const router = express.Router()
const followController = require('../controller/followController')


// http://localhost:8080/api/v1/follow/

router.get('/', followController.index)
router.post('/create/:userIdFollowed', followController.handleCreateFollow)
router.delete('/delete/:userIdFollowed', followController.handleDeleteFollow)
router.delete('/delete1/:userIdFollow', followController.handleDeleteFollow1)




module.exports = router