const dummy = (blogs) =>{
    return 1
}

const total_likes = (blogs) =>{
    if(blogs.length === 0){
        return 0
    }

    const totalLikes = blogs.reduce((sum,blog)=>{
        //console.log(sum,blog.likes)
        return sum+blog.likes
    },0)

    return totalLikes
}


const fav_blog = (blogs) =>{
    if(blogs.length===0){
        return null 
    }

    const favBlog = blogs.reduce((fav,blog)=>{
        return fav.likes > blog.likes ? fav : blog
    })

    return favBlog
}


const most_blogs = (blogs)=>{
    if(blogs.length === 0){
        return null 
    }

    const blogCount = {}

    blogs.forEach((blog)=>{
        if(blog.author in blogCount){
            blogCount[blog.author] += 1
        }else{
            blogCount[blog.author] = 1
        }
    })

    let maxBlogs = 0
    let authorWithMaxBlogs = ''

    for(const author in blogCount){
        if(blogCount[author] > maxBlogs){
            maxBlogs = blogCount[author]
            authorWithMaxBlogs = author
        }   
    }
    return {author: authorWithMaxBlogs, blogs: maxBlogs}
}

const most_likes = (blogs)=>{
    if(blogs.length === 0){
        return null 
    }

    const likesCount = {}

    blogs.forEach((blog)=>{
        if(blog.author in likesCount){
            likesCount[blog.author] += blog.likes
        }else{
            likesCount[blog.author] = blog.likes
        }
    })

    let maxLikes = 0
    let authorWithMaxLikes = ''

    for(const author in likesCount){
        if(likesCount[author] > maxLikes){
            maxLikes = likesCount[author]
            authorWithMaxLikes = author
        }   
    }
    return {author: authorWithMaxLikes, likes: maxLikes}
}   

module.exports = {dummy, total_likes, fav_blog, most_blogs, most_likes}