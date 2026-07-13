const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')

const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const Blog = require('../models/blogSchema')
const api = supertest(app)
const listHelper = require('../utils/list_helper.js')

const singleBlog = [
    {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
        likes: 5,
        __v: 0
    }
]

const manyBlogs = [
    {
        _id: '5a422a851b54a676234d17f7',
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
        __v: 0
    },
    {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        __v: 0
    },
    {
        _id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12,
        __v: 0
    },
    {
        _id: '5a422b891b54a676234d17fa',
        title: 'First class tests',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
        likes: 10,
        __v: 0
    },
    {
        _id: '5a422ba71b54a676234d17fb',
        title: 'TDD harms architecture',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
        likes: 0,
        __v: 0
    },
    {
        _id: '5a422bc61b54a676234d17fc',
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 2,
        __v: 0
    }
]

describe('list helper', () => {
    test('dummy function returns 1', () => {
        const blogs = []
        const result = listHelper.dummy(blogs)
        assert.strictEqual(result, 1)
    })

    describe('total likes', () => {
        test('empty list has zero likes', () => {
            assert.strictEqual(listHelper.total_likes([]), 0)
        })

        test('when list has only one blog, it returns the likes the blog has', () => {
            assert.strictEqual(listHelper.total_likes(singleBlog), 5)
        })

        test('when list has many blogs, it returns the total likes of all blogs', () => {
            assert.strictEqual(listHelper.total_likes(manyBlogs), 36)
        })
    })

    describe('favorite blog', () => {
        test('empty list has no favorite blog', () => {
            assert.deepStrictEqual(listHelper.fav_blog([]), null)
        })

        test('when list has only one blog, it returns that blog as the favorite blog', () => {
            assert.deepStrictEqual(listHelper.fav_blog(singleBlog), singleBlog[0])
        })

        test('when list has many blogs, it returns the blog with most likes as the favorite blog', () => {
            assert.deepStrictEqual(listHelper.fav_blog(manyBlogs), manyBlogs[2])
        })
    })

    describe('most blogs', () => {
        test('empty list has no author with most blogs', () => {
            assert.deepStrictEqual(listHelper.most_blogs([]), null)
        })

        test('when list has only one blog, it returns the author of that blog as the author with most blogs', () => {
            assert.deepStrictEqual(listHelper.most_blogs(singleBlog), {
                author: singleBlog[0].author,
                blogs: 1
            })
        })

        test('when list has many blogs, it returns the author with most blogs', () => {
            assert.deepStrictEqual(listHelper.most_blogs(manyBlogs), {
                author: 'Robert C. Martin',
                blogs: 3
            })
        })
    })

    describe('most likes', () => {
        test('empty list has no author with most likes', () => {
            assert.deepStrictEqual(listHelper.most_likes([]), null)
        })

        test('when list has only one blog, it returns the author of that blog as the author with most likes', () => {
            assert.deepStrictEqual(listHelper.most_likes(singleBlog), {
                author: singleBlog[0].author,
                likes: 5
            })
        })

        test('when list has many blogs, it returns the author with most likes', () => {
            assert.deepStrictEqual(listHelper.most_likes(manyBlogs), {
                author: 'Edsger W. Dijkstra',
                likes: 17
            })
        })
    })
})

describe('blog api', () => {
    const initialBlogs = [
        {
            title: 'React patterns',
            author: 'Michael Chan',
            url: 'https://reactpatterns.com/',
            likes: 7
        },
        {
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
            likes: 5
        }
    ]

    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(initialBlogs)
    })

    test('all blogs are returned as JSON', async () => {
        const response = await api.get('/api/blogs')

        assert.strictEqual(response.status, 200)
        assert.strictEqual(response.body.length, initialBlogs.length)
    })

    test('all blogs have a property id', async () => {
        const response = await api.get('/api/blogs')

        for (const blog of response.body) {
            assert.ok(Object.prototype.hasOwnProperty.call(blog, 'id'))
        }
    })

    describe('creating a blog using post request', () => {
        const newBlogExample = {
            title: 'The-Daily-Stoic-5',
            author: 'Ryan Holiday',
            url: 'https://dailystoic.com/'
        }

        const newExistingBlogExample = {
            title: 'React patterns',
            author: 'Ryan Holiday',
            url: 'https://dailystoic.com/'
        }

        test('creating a new blog with existing title returns 409', async () => {
            const response = await api
                .post('/api/blogs')
                .send(newExistingBlogExample)
                .expect(409)

            assert.strictEqual(response.body.error, 'Blog already exists')
        })

        test('creating a new blog with unique title returns 201 and defaults likes to 0', async () => {
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
            assert.strictEqual(response.body.likes, 0)
            assert.strictEqual(finalCount, initialCount + 1)
        })
    })

    describe('deleting a blog', () => {
        test('deleting an existing blog returns 204 and removes it', async () => {
            const blogsAtStart = await api.get('/api/blogs')
            const blogToDelete = blogsAtStart.body[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(204)

            const blogsAtEnd = await api.get('/api/blogs')
            const blogIds = blogsAtEnd.body.map(blog => blog.id)

            assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length - 1)
            assert.ok(!blogIds.includes(blogToDelete.id))
        })

        test('deleting a blog with a non-existing id returns 404', async () => {
            await api
                .delete('/api/blogs/000000000000000000000000')
                .expect(404)
        })
    })

    describe('updating a blog', () => {
        test('updating an existing blog returns 200 and updates fields', async () => {
            const blogsAtStart = await api.get('/api/blogs')
            const blogToUpdate = blogsAtStart.body[0]

            const updatedData = {
                title: 'Updated Title',
                author: blogToUpdate.author,
                url: 'https://updated.example.com/',
                likes: 42
            }

            const response = await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(updatedData)
                .expect(200)

            assert.strictEqual(response.body.title, updatedData.title)
            assert.strictEqual(response.body.url, updatedData.url)
            assert.strictEqual(response.body.likes, updatedData.likes)
        })

        test('updating a non-existing id returns 404', async () => {
            const nonExistingId = new mongoose.Types.ObjectId().toString()

            await api
                .put(`/api/blogs/${nonExistingId}`)
                .send({ title: 'x', url: 'https://x' })
                .expect(404)
        })

        test('updating with invalid payload missing title or url returns 400', async () => {
            const blogsAtStart = await api.get('/api/blogs')
            const blogToUpdate = blogsAtStart.body[0]

            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send({ author: 'No Title/URL' })
                .expect(400)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})
