import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog.model";
import mongoose from "mongoose";

export async function GET() {
    await dbConnect()

    try {
        const session = await getServerSession(authOptions)
        const user = session?.user

        if(!session || !user){
            return Response.json({
                success: false,
                message: "You have to sign in to see blogs"
            }, {
                status: 401
            })
        }
        const userId = new mongoose.Types.ObjectId(user._id as string)
        // finding Blogs by aggregate pipeline
        const blogsByPipe = await BlogModel.aggregate([
            {
                $match:{
                    ownedById: userId
                }
            },
            {
                $sort:{
                    createdAt: -1
                }
            },{
                $project:{
                    _id:1,
                    title:1,
                    createdAt:1
                }
            }
        ]).exec()
        return  Response.json({
            success: true,
            data: blogsByPipe
        },{
            status: 200})

    } catch (error) {
        console.log(error)
        return Response.json({
            success: false,
            message: "Error getting user blogs"
        },{
            status: 500
        })
    }
}