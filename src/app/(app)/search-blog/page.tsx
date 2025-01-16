'use client'

import { useToast } from '@/hooks/use-toast';
import { searchWordSchema } from '@/schemas/searchWordSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import React, {useState} from 'react'
import { useForm } from 'react-hook-form';
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react';
import BlogCard from '@/components/BlogCard';
import { Blog } from '@/model/Blog.model';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const page = () => {
    const [searchWord, setSearchWord] = useState("");
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const {toast} = useToast()
    

    const form = useForm<z.infer<typeof searchWordSchema>>({
        resolver: zodResolver(searchWordSchema),
        defaultValues: {
          searchWord: "",
        },
    })
    const onSubmit = async(data: z.infer<typeof searchWordSchema>) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/search-blog',data)
            if(!response.data.success){
                toast({
                    title:"No Blogs Found",
                    description: response.data.message
                })
            }
            else{
                setBlogs(response.data.data)
                toast({
                    title: "Blogs found",
                    description: response.data.message
                })
            }

        } catch (error) {
            toast({
                title:"No Blogs Found",
                description: "Try different keyword"
            })
        }finally{
            setLoading(false);
        }
    }
  return (
    <>
    <header>
    <Navbar />
    </header>
    
    <main className="flex flex-col gap-8 p-6 max-w-5xl mx-auto mt-16">
  <div className="bg-white p-6 rounded-lg shadow-md border">
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="searchWord"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-medium text-gray-700">
                Search
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Type any keyword"
                  {...field}
                  className="border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm mt-1" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full py-2 px-4 text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow transition duration-200"
        >
          Submit
        </Button>
      </form>
    </Form>
  </div>

  <div className="container mx-auto px-4 py-8">
    {loading ? (
      <div className="flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    ) : (
        <div className="grid gap-6">
        {blogs.map((blog: Blog) => (
          <div key={blog._id as string} className="p-4 border rounded shadow">
            <BlogCard blog={blog} forUser={false} />
          </div>
        ))}
      </div>
      
    )}
  </div>
</main>
    <footer>
    <Footer />
    </footer>
    
    </>
  )
}

export default page
