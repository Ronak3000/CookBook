"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useParams } from "next/navigation";
import { Blog } from "@/model/Blog.model";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Page = () => {
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const { toast } = useToast();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [owner, setOwner] = useState<string | null>("No Owner");

  


  useEffect(() => {
    
    const getIndividualBlog = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/get-individual-blogs?id=${params.id as string}`
        );
        if (response.data.success) {
          toast({
            title: "Success",
            description: "Blog fetched successfully",
          });
          setBlog(response.data.data);
          setOwner(response.data.owner);
        } else {
          toast({
            title: "Error",
            description: "No blog found",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.log(error);
        toast({
          title: "Error",
          description: "Failed to fetch blog",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getIndividualBlog();
  }, []);

  return (
    <>
    <header>
    <Navbar />
    </header>
    <main className="flex-grow pt-16 pb-16 bg-gray-100">
    <div className="container mx-auto max-w-3xl px-6 py-12">
  {loading ? (
    <p className="text-center text-gray-400 text-lg">Loading...</p>
  ) : blog ? (
    <div className="bg-white shadow-lg rounded-lg border border-gray-300 p-8">
      <h1 className="text-4xl font-bold text-gray-900 leading-tight">{blog.title}</h1>
      <p className="text-base text-gray-600 mt-3">
        By <span className="font-medium text-gray-800">{owner || "Unknown"}</span>
      </p>
      <hr className="my-6 border-gray-200" />
      <div className="prose prose-lg text-gray-800 leading-relaxed">
        {blog.bodyOfBlog || "No content available."}
      </div>
    </div>
  ) : (
    <p className="text-center text-gray-500 text-lg">No blog found.</p>
  )}
    </div>
    </main>
    
    <footer>
      <Footer />
    </footer>
    </>
    

  );
};

export default Page;
