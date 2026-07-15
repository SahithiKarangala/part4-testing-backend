const express = require('express')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
//const morgan = require('morgan')

const app = express()
logger.info('Connecting to MongoDB', config.MONGODB_URL)

mongoose.connect(config.MONGODB_URL, {family:4})
.then(()=>{
    logger.info(`Connected to MongoDB`)
})
.catch((error)=>{
    logger.error(`Error occured while connecting to mongoDB ${error}`)
})

app.use(express.json()) 
app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app 