'use client';

import { useToast } from '@/hooks/use-toast';
import { Blog } from '@/model/Blog.model';
import axios from 'axios';
import React from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type BlogCardProps = {
    blog: Blog;
    forUser: boolean;
    onBlogDeleted?: (id: string) => void;
};

const BlogCard = ({ blog, forUser, onBlogDeleted }: BlogCardProps) => {
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`/api/delete-blog?id=${blog._id}`);
            if (response.data.success) {
                onBlogDeleted?.(blog._id as string); 
                toast({ title: "Success", description: response.data.message });
            } else {
                toast({ title: "Error", description: response.data.message, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete the blog.", variant: "destructive" });
        }
    };

    const handleEdit = () => {
        router.replace(`/edit-blog/${blog._id}`);
    };

    return (
        <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
            <Card className="p-6">
                <CardHeader className="mb-4">
                    <CardTitle>
                        <a
                            href={`/get-individual-blog/${blog._id}`}
                            className="text-blue-600 hover:underline"
                        >
                            {blog.title || "Untitled Blog"}
                        </a>
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-2">
                        {new Date(blog.createdAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </CardHeader>

                {forUser && (
                    <div className="flex justify-between items-center">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="flex items-center space-x-2">
                                    <X className="h-4 w-4" />
                                    <span>Delete</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-50 border border-gray-200 rounded-md shadow-lg p-4">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-lg font-bold text-gray-800">Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm text-gray-600">
                                        This action cannot be undone. This will permanently delete your blog.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-4">
                                    <AlertDialogCancel className="px-4 py-2 text-gray-600">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md"
                                    >
                                        Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button onClick={handleEdit} className="bg-blue-600 text-white px-4 py-2 rounded-md">Edit</Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default BlogCard;
