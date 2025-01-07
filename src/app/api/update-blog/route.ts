import BlogModel from "@/model/Blog.model";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

export async function POST(request: Request){
    await dbConnect()

    try {
        const {title,bodyOfBlog} = await request.json()
        const {searchParams} = new URL(request.url)
        
        const blogId =  searchParams.get('id')
        const individualBlogId = new mongoose.Types.ObjectId(blogId as string)
        if(!individualBlogId){
            return Response.json({
                success: false,
                message: "Invalid Blog Id"
            },{status: 400})
        }

        const updatedBlog = await BlogModel.findByIdAndUpdate(individualBlogId,
            {
                title,
                bodyOfBlog
            },
            {new: true}
        )
        if(!updatedBlog){
            return Response.json({
                success: false,
                message:"Failed to get individual blog"
            },{status: 401})
        }
        return Response.json({
            success: true,
            message:"Blog updated successfully"
        },{status: 200})

    } catch (error) {
        return Response.json({
            success: false,
            message:`Failed to update Blog: ${error}`
        },{status: 500})
    }
}