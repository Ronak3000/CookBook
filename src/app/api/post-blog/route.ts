import { getServerSession } from "next-auth";
import { BlogVerificationSchema } from "@/schemas/blogVerificationSchema";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog.model";
import mongoose from "mongoose";

export async function POST(requset: Request){
    await dbConnect()

    try {
        const session = await getServerSession(authOptions)
        const user = session?.user

        if(!session || !user){
            return Response.json({
                success: false,
                message: "You have to sign in to post blogs"
            }, {
                status: 401
            })
        }
        const {title, bodyOfBlog} = await requset.json()
        const result = BlogVerificationSchema.safeParse({title, bodyOfBlog})

        if(!result.success){
            return Response.json({
                success: false,
                message: result.error.format().title?._errors[0]
            }, {
                status: 400
            })
        }

        const ownedById = new mongoose.Types.ObjectId(user._id as string)
        const newBlog = new BlogModel({
            ownedById,
            title,
            bodyOfBlog,
            createdAt: Date.now()
        })

        await newBlog.save()


        return Response.json({
            success: true,
            message: "Blog posted successfully"
        },{status: 200})

    } catch (error) {
        console.log(error)
        return Response.json({
            success: false,
            message: "Something went wrong while posting the blog"
        },{status: 500})
    }
}