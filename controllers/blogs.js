const blogsRouter = require('express').Router() 
const Blog = require('../models/blogSchema')

blogsRouter.get('/', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
})

blogsRouter.post('/', async (request, response,next) => {
  const title = request.body.title
  
  const existingBlog = await Blog.findOne({title: title})

  if(existingBlog){
    return response.status(409).send({error: "Blog already exists"})
  }
  const blog = new Blog(request.body)

  blog.save().then((result) => {
    response.status(201).json(result)
  }).catch(error => next(error))
})

module.exports = blogsRouter