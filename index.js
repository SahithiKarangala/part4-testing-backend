require('dotenv').config()
const express = require('express')
const Blog = require('./models/blogSchema')
const mongoose = require('mongoose')
const morgan = require('morgan')

const app = express()
app.use(express.json())


morgan.token('body',(req,res)=>{
    if(req.method === 'POST'){
        return JSON.stringify(req.body)
    }
    return ""
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

//let blog_list=[]

app.get('/api/blogs', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
})

app.post('/api/blogs', async (request, response,next) => {
  const title = request.body.title
  console.log(`post request body ${request.body.title}`)
  const blog = new Blog(request.body)
  
  const existingBlog = await Blog.findOne({title: title})
  console.log(`existing blog ${existingBlog}`)
  if(existingBlog){
    return response.status(409).send({error: "Blog already exists"})
  }

  blog.save().then((result) => {
    response.status(201).json(result)
  }).catch(error => next(error))
})

const unknownEndpoint = (req,res)=>{
    res.status(404).send({error: "Unknown Endpoint"})
}

app.use(unknownEndpoint)


const errorHandler = (error,req,res,next)=>{
    console.log(error.message)
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})