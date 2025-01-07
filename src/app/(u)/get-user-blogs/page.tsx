'use client'

import Navbar from '@/components/Navbar'
import { useToast } from '@/hooks/use-toast'
import { Blog } from '@/model/Blog.model'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect, useCallback } from 'react'
import BlogCard from '@/components/BlogCard'
import Footer from '@/components/Footer'

const Page = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [blogs, setBlogs] = useState<Blog[]>([])

  const onBlogDeleted = (id: string) => {
    setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== id))
  }

  const getAllBlogs = useCallback(async()=>{
    setLoading(true)
      try {
        const response = await axios.get('/api/get-user-blogs')
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
    <main>

    <div>
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500">No blogs found</p>
            <button
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => router.replace('/post-blogs')}
            >
              Write your first blog
            </button>
          </div>
        ) : (
            <div className="grid gap-6">
            {blogs.map((blog: Blog) => (
              <div key={blog._id as string} className="p-4 border rounded shadow">
                <BlogCard blog={blog} forUser={true} onBlogDeleted={onBlogDeleted} />
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
