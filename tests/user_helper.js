const User = require('../models/userSchema')
const bcrypt = require('bcrypt') 

const userInDB = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
} 

module.exports = {
    userInDB
}