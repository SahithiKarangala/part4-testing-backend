const {test,describe,beforeEach, after} = require('node:test')
const assert = require('node:assert')

const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const Blog = require('../models/blogSchema')
const api = supertest(app)

const listHelper = require('../utils/list_helper.js') 

test('dummy function returns 1',()=>{
    const blogs=[] 

    const result = listHelper.dummy(blogs)
    assert.strictEqual(result,1)
})

test.only('All blogs are returned in JSON format', async()=>{
    const result = await api.get('/api/blogs')
    assert.strictEqual(result.body.length, 10)
    //await api 
    //.get('/api/blogs')
    //.expect(200)
    //.expect('Content-Type',/application\/json/)
})
test.only('All blogs have a property id', async () => {
    const result = await api.get('/api/blogs')

    for (const blog of result.body) {
        assert.ok(Object.prototype.hasOwnProperty.call(blog, 'id'))
    }
})

describe('Creating a blog using post request',()=>{
    const newBlogExample = {
        title: "The-Daily-Stoic-5",  
        author: "Ryan Holiday",
        url: "https://dailystoic.com/",
    }

    const newExistingBlogExample = {
        title: "The-Daily-Stoic-1",
        author: "Ryan Holiday",
        url: "https://dailystoic.com/"
    }

    const newBlogWithMissingTitleOrUrl = [
        {
            title: "The-Daily-Stoic-2", 
            author: "Ryan Holiday"
        },
        {   author: "Ryan Holiday",
            url: "https://dailystoic.com/"
        },
        {
            title: "The-Daily-Stoic-4",
        }
    ]

    test.only('creating a new blog with existing title returns 409', async () => {
        const response = await api
            .post('/api/blogs')
            .send(newExistingBlogExample)
            .expect(409)

        assert.strictEqual(response.body.error, "Blog already exists")
    })

    test.only('creating a new blog with unique title returns 201', async () => {
        const initialResponse = await api.get('/api/blogs')
        const initialCount = initialResponse.body.length

        const response = await api
            .post('/api/blogs')
            .send(newBlogExample)
            .expect(201)

        const finalResponse = await api.get('/api/blogs')
        const finalCount = finalResponse.body.length

        assert.strictEqual(response.body.title, newBlogExample.title)
        assert.strictEqual(response.body.author, newBlogExample.author)
        assert.strictEqual(response.body.url, newBlogExample.url)
        assert.strictEqual(finalCount, initialCount + 1)
        assert.strictEqual(response.body.likes, 0)
    })

    test.only('creating a new blog with missing title or url returns 400', async () => {
        for (const blog of newBlogWithMissingTitleOrUrl) {
            const response = await api
                .post('/api/blogs')
                .send(blog)
                .expect(400)

            assert.strictEqual(response.body.error, "Missing title or url property")
        }
    })
})

describe('total likes',()=>{
    const emptyBlog=[] 
    const listWithOneBlog = [
        {
            _id: '5a422aa71b54a676234d17f8',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
            likes: 5,
            __v: 0

        }
    ]
    const listWithManyBlogs = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            __v: 0
        },
        {
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0
        },
        {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            __v: 0
        },
        {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 10,
            __v: 0
        },
        {
            _id: "5a422ba71b54a676234d17fb",
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
            likes: 0,
            __v: 0
        },
        {
            _id: "5a422bc61b54a676234d17fc",
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2,
            __v: 0
        }  
    ]
    
    test('empty list has zero likes',()=>{
        const result = listHelper.total_likes(emptyBlog)
        assert.strictEqual(result,0)
    })

    test('when list has only one blog, it returns the likes the blog has',()=>{
        const result = listHelper.total_likes(listWithOneBlog)
        assert.strictEqual(result,5)
    })

    test('when list has many blogs, it returns the total likes of all blogs',()=>{
        const result = listHelper.total_likes(listWithManyBlogs)
        assert.strictEqual(result,36)
    })
})

describe('favorite blog',()=>{
    const emptyBlog=[] 
    const listWithOneBlog = [
        {
            _id: '5a422aa71b54a676234d17f8',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
            likes: 5,
            __v: 0

        }
    ]
    const listWithManyBlogs = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            __v: 0
        },
        {
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0
        },
        {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            __v: 0
        },
        {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 10,
            __v: 0
        },
        {
            _id: "5a422ba71b54a676234d17fb",
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
            likes: 0,
            __v: 0
        },
        {
            _id: "5a422bc61b54a676234d17fc",
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2,
            __v: 0
        }  
    ]

    test('empty list has no favorite blog',()=>{
        const result = listHelper.fav_blog(emptyBlog)
        assert.deepStrictEqual(result,null)
    })

    test('when list has only one blog, it returns that blog as the favorite blog',()=>{
        const result = listHelper.fav_blog(listWithOneBlog)
        assert.deepStrictEqual(result,listWithOneBlog[0])
    })

    test('when list has many blogs, it returns the blog with most likes as the favorite blog',()=>{
        const result = listHelper.fav_blog(listWithManyBlogs)
        assert.deepStrictEqual(result, listWithManyBlogs[2])
    })
})

describe('most blogs',()=>{
    const emptyBlog=[] 
    const listWithOneBlog = [
        {
            _id: '5a422aa71b54a676234d17f8',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
            likes: 5,
            __v: 0

        }
    ]
    const listWithManyBlogs = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            __v: 0
        },
        {
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0
        },
        {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            __v: 0
        },
        {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 10,
            __v: 0
        },
        {
            _id: "5a422ba71b54a676234d17fb",
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
            likes: 0,
            __v: 0
        },
        {
            _id: "5a422bc61b54a676234d17fc",
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2,
            __v: 0
        }  
    ]

    test('empty list has no author with most blogs',()=>{
        const result = listHelper.most_blogs(emptyBlog)
        assert.deepStrictEqual(result,null)
    })

    test('when list has only one blog, it returns the author of that blog as the author with most blogs',()=>{
        const result = listHelper.most_blogs(listWithOneBlog)
        assert.deepStrictEqual(result,{author: listWithOneBlog[0].author, blogs: 1})
    })

    test('when list has many blogs, it returns the author with most blogs',()=>{
        const result = listHelper.most_blogs(listWithManyBlogs)
        assert.deepStrictEqual(result,{author: "Robert C. Martin", blogs: 3})
    })
})

describe('most likes',()=>{
    const emptyBlog=[] 
    const listWithOneBlog = [
        {
            _id: '5a422aa71b54a676234d17f8',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
            likes: 5,
            __v: 0

        }
    ]
    const listWithManyBlogs = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            __v: 0
        },
        {
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0
        },
        {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            __v: 0
        },
        {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 10,
            __v: 0
        },
        {
            _id: "5a422ba71b54a676234d17fb",
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
            likes: 0,
            __v: 0
        },
        {
            _id: "5a422bc61b54a676234d17fc",
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2,
            __v: 0
        }  
    ]

    test('empty list has no author with most likes',()=>{
        const result = listHelper.most_likes(emptyBlog)
        assert.deepStrictEqual(result,null)
    })

    test('when list has only one blog, it returns the author of that blog as the author with most likes',()=>{
        const result = listHelper.most_likes(listWithOneBlog)
        assert.deepStrictEqual(result,{author: listWithOneBlog[0].author, likes: 5})
    })

    test('when list has many blogs, it returns the author with most likes',()=>{
        const result = listHelper.most_likes(listWithManyBlogs)
        assert.deepStrictEqual(result,{author: "Edsger W. Dijkstra", likes: 17})
    })  
})


after(async () => {
  await mongoose.connection.close()
})