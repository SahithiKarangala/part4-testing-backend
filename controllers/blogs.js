const blogsRouter = require('express').Router() 
const Blog = require('../models/blogSchema')
const User = require('../models/userSchema')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if(authorization && authorization.startsWith('Bearer ')){
        return authorization.replace('Bearer ',"")
    }
    return null
}


blogsRouter.get('/', async (request, response) => {
    const blog = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blog)
})

blogsRouter.post('/', async (request, response,next) => {

    //check if a blog already exists with the same title, if yes return 409 conflict error
  const title = request.body.title

  const token = getTokenFrom(request)
  if (!token) {
    return response.status(401).send({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if(!decodedToken.id){
    return response.status(401).send({error: "Token missing or invalid"})
  }

  const user = await User.findById(decodedToken.id)
  if(!user){
    return response.status(401).send({error: "User not found"})
  }
  
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

  //const user = await User.findById(request.body.userId)

  //if(!user){
  //  return response.status(400).send({error: "User not found"})
  //}

  const blog = new Blog({
    title: request.body.title,  
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)

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

blogsRouter.put('/:id', async (request, response, next) => {
  const id = request.params.id
  const updatedBlog = request.body

  // Validate input: title and url are required
  if (!updatedBlog.title || !updatedBlog.url) {
    return response.status(400).send({ error: 'Title and url are required' })
  }

  const blog_to_update = await Blog.findById(id)
  if (!blog_to_update) {
    return response.status(404).send({ error: 'Blog not found' })
  }

  const updatedBlogResult = await Blog.findByIdAndUpdate(id, updatedBlog, {
    new: true,
    runValidators: true,
  })

  response.json(updatedBlogResult)
})

module.exports = blogsRouter