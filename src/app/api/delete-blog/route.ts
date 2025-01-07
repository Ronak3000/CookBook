import BlogModel from "@/model/Blog.model";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

export async function DELETE(request: Request) {
    await dbConnect()
    try {
        const {searchParams} = new URL(request.url)
        const blogId =  searchParams.get('id')
        const individualBlogId = new mongoose.Types.ObjectId(blogId as string)
        if(!individualBlogId){
            return Response.json({
                success: false,
                message: "Invalid Blog Id"
            },{status: 400})
        }
        const deletedBlog = await BlogModel.findByIdAndDelete(individualBlogId)
        if(!deletedBlog){
            return Response.json({
                success: false,
                message: "Failed to get individual blog"
            },{status: 401})
        }
        return Response.json({
            success: true,
            message: "Blog deleted successfully"
        },{status: 200})
    } catch (error) {
        return Response.json({
            success: false,
            message: `error getting Individual blogs: ${error}`
        },{status: 500})
    }}
