'use client'

import Navbar from '@/components/Navbar'
import { useToast } from '@/hooks/use-toast'
import { Blog } from '@/model/Blog.model'
import axios from 'axios'

import React, { useState, useEffect, useCallback } from 'react'
import BlogCard from '@/components/BlogCard'
import Footer from '@/components/Footer'

const Page = () => {
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [blogs, setBlogs] = useState<Blog[]>([])

  const onBlogDeleted = (id: string) => {
    setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== id))
  }

  const getAllBlogs = useCallback(async()=>{
    setLoading(true)
      try {
        const response = await axios.get('/api/get-all-blogs')
        setBlogs(response.data.data)
        toast({
          title: 'Success',
          description: 'Blogs fetched successfully',
        })
      } catch (error) {
        console.log(error)
        toast({
          title: 'Error',
          description: 'No blogs found',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    
  },[setLoading, setBlogs])

  useEffect(() => {
    getAllBlogs()
  }, [setBlogs, getAllBlogs]) 

  return (
    <>
    <header>
    <Navbar />
    </header>
    <main className="flex-grow pt-16 pb-16 bg-gray-100">
    <div>
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : blogs.length==0?(<>
          <p className="text-center text-gray-500">No blogs found</p>
        </>) :(
          <div className="grid gap-6">
            {blogs.map((blog: Blog) => (
              <div key={blog._id as string} className="p-4 border rounded shadow">
                <BlogCard blog={blog} forUser={false} onBlogDeleted={onBlogDeleted} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </main>
    <footer>
      <Footer />
    </footer>
    </>
    
  )
}

export default Page
