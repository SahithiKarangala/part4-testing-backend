const blogsRouter = require('express').Router() 
const Blog = require('../models/blogSchema')

blogsRouter.get('/', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
})

blogsRouter.post('/', async (request, response,next) => {

    //check if a blog already exists with the same title, if yes return 409 conflict error
  const title = request.body.title
  
  const existingBlog = await Blog.findOne({title: title})

  if(existingBlog){
    return response.status(409).send({error: "Blog already exists"})
  }
  // --------- 

  //check if the blog is missing likes property, if yes set it to 0
    if(!request.body.likes){ 
        request.body.likes = 0
    }
  // ---------

  //check if the blog is missing title or url property, if yes return 400 bad request error
  if(!request.body.title || !request.body.url){
    return response.status(400).send({error: "Missing title or url property"})
  }
  // ---------

  const blog = new Blog(request.body)

  blog.save().then((result) => {
    response.status(201).json(result)
  }).catch(error => next(error))
})

blogsRouter.delete('/:id',async(request,response,next)=>{
    const id = request.params.id 
    const blog_to_delete = await Blog.findById(id)

    if(!blog_to_delete){
        return response.status(404).send({error: "Blog not found"})
    }
    
    await Blog.findByIdAndDelete(id)
    response.status(204).end()
})

module.exports = blogsRouter