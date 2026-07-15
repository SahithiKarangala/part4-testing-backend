const bcrypt = require('bcrypt') 
const usersRouter = require('express').Router()
const User = require('../models/userSchema') 

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}) 
    response.json(users)
})

usersRouter.post('/', async (request, response, next) => {
    const { username, name, password } = request.body

    // Validate input: username and password are required
    if (!username || !password) {
        return response.status(400).send({ error: 'Username and password are required' })
    }

    // Validate input: username must be at least 3 characters long
    if (username.length < 3) {
        return response.status(400).send({ error: 'Username must be at least 3 characters long' })
    }

    // Validate input: password must be at least 3 characters long
    if (password.length < 3) {
        return response.status(400).send({ error: 'Password must be at least 3 characters long' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
})

module.exports = usersRouter