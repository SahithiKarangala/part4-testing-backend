const testingRouter = require('express').Router()
const Blog = require('../models/blogSchema')
const User = require('../models/userSchema')

testingRouter.post('/reset', async (request, response) => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

module.exports = testingRouter