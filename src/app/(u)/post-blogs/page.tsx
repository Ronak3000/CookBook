"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BlogVerificationSchema } from "@/schemas/blogVerificationSchema";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const Page = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof BlogVerificationSchema>>({
    resolver: zodResolver(BlogVerificationSchema),
    defaultValues: {
      title: "",
      bodyOfBlog: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof BlogVerificationSchema>) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/post-blog", data);
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
        });
        router.replace("/dashboard");
      } else {
        toast({
          title: "Error",
          description: "Could not post blog",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to post blog. Try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        {!session || !user ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600">You must sign in to create a blog post.</p>
            <a
              href="/sign-in"
              className="text-blue-600 hover:underline hover:text-blue-800 font-medium"
            >
              Sign In
            </a>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your blog title"
                        {...field}
                        className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bodyOfBlog"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your blog content here..."
                        {...field}
                        className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-md h-32"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-right">
                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default Page;
