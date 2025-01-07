import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { verifySchema } from "@/schemas/verifySchema";
import { log } from "node:console";

import {z} from "zod"

export async function POST(request:Request){
    await dbConnect()

    try {
        const {username, code} = await request.json()
        const decodedUsername = decodeURIComponent(username)
        const result = verifySchema.safeParse({code})

        if(!result.success){
            const error = result.error.format().code?._errors || []

            return Response.json({
                success: false,
                message: error.length > 0 ? error[0] : "Invalid Code"
            },{status: 400})
        }
        // console.log(decodedUsername)
        const user = await UserModel.findOne({
            username: decodedUsername
        })
        // console.log(user)
        if(!user){
            
            return Response.json({
                success: false,
                message: "User with username doesnot exist"
            },{status: 400})
        }

        const expiryDate = user.verifyCodeExpirey
        const isNotExpiredCode = new Date(expiryDate)> new Date()
        const isCodeValid = user.verifyCode === code

        if(isNotExpiredCode && isCodeValid){
            user.isVerified = true
            await user.save()
            return Response.json({
                success: true,
                message: "Code verified"
            },{status: 200})
        }else if(!isCodeValid){
            console.log("error 1")
            return Response.json({
                success: false,
                message: "Code is not matching"
            },{status: 400})
        }
        else{
            console.log("error 2")
            return Response.json({
                success: false,
                message: "code has expired SignUp again"
            },{status: 400})
        }

    } catch (error) {
        return Response.json({
            success: false,
            message: "there was an error checking the verification code"
        },{status: 500})
    }
}