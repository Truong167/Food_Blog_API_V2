const db = require('../models/index')
const sequelize = require('sequelize')
const { Op } = sequelize

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
};

const validatePassword = (password) => {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,}$/
    if (password.length <= 6 || password === '' || !re.test(password)) {
      return false
    }
    return true
}

const checkEmailExists = async (email, userId = null) => {
    let user = await db.User.findOne({where: {email: email, userId: {[Op.ne]: userId}}})
    if(user) return true
    return false
}

const checkAccountExists = async (account) => {
    let accountName = await db.Account.findByPk(account)
    if(accountName) return true
    return false
}

module.exports = {
    validateEmail,
    validatePassword,
    checkEmailExists,
    checkAccountExists
}
  