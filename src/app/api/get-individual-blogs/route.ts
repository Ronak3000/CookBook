import BlogModel, { Blog } from "@/model/Blog.model";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import UserModel from "@/model/User.model";

export async function GET(request:Request){
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
        
        const blog = await BlogModel.findById(individualBlogId)
        if(!blog){
            return Response.json({
                success: false,
                message: "Invalid Individual Blog Id"
            },{status: 400})
        }
        const ownerId = blog.ownedById
        const individualOwnerId = new mongoose.Types.ObjectId(ownerId)
        const owner = await UserModel.findById(individualOwnerId)

        return Response.json({
            success: true,
            data: blog,
            owner: owner?.username || "No owner"
        },{status: 200})
    } catch (error) {
        return Response.json({
            success: false,
            message: `error getting Individual blogs: ${error}`
        },{status: 500})
    }
}