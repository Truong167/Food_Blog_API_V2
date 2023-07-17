
const db = require('../models/index')

class followController {
    index = (req, res) => {
        res.send('follow')
    }

    handleCreateFollow = async (req, res) => {
        try {
            let { userIdFollowed } = req.params
            let user = await db.User.findByPk(userIdFollowed)
            let check = await db.Follow.findOne({where: {userIdFollowed: userIdFollowed, userIdFollow: req.userId}})
            if(check) {
                res.status(446).json({
                    success: false,
                    message: `User has followed this user`,
                    data: ''
                })
            }
            else if(user) {
                let follow = await db.Follow.create({
                    userIdFollow: req.userId,
                    userIdFollowed: userIdFollowed,
                    isSeen: false
                })
                res.status(200).json({
                    success: true,
                    message: 'Successfully',
                    data: follow
                })
            } else {
                res.status(426).json({
                    success: false, 
                    message: 'User not found',
                    data: ""
                })
            }
        } catch (error) {
            res.status(500).json({
                success: false, 
                message: error.message,
                data: ""
            })
        }
    }

    handleDeleteFollow = async (req, res) => {
        try {
            let { userIdFollowed } = req.params
            let follow = await db.Follow.findOne({
                where: {
                    userIdFollow: req.userId, 
                    userIdFollowed: userIdFollowed,
                }
            })
            if(follow) {
                let followData = await follow.destroy()
                res.status(200).json({
                    success: true, 
                    message: 'Successfully',
                    data: followData
                })
                return
            }
            res.status(435).json({
                success: false, 
                message: 'Follow not found',
                data: ""
            })
        } catch (error) {
            res.status(500).json({
                success: false, 
                message: error.message,
                data: ""
            })
        }
    }

    handleDeleteFollow1 = async (req, res) => {
        try {
            let { userIdFollow } = req.params
            let follow = await db.Follow.findOne({
                where: {
                    userIdFollowed: req.userId, 
                    userIdFollow: userIdFollow,
                }
            })
            if(follow) {
                let followData = await follow.destroy()
                res.status(200).json({
                    success: true, 
                    message: 'Successfully',
                    data: followData
                })
                return
            }
            res.status(435).json({
                success: false, 
                message: 'Follow not found',
                data: ""
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


module.exports = new followController