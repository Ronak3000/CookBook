import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import bcrypt from "bcryptjs";

export async function POST(request: Request){
    await dbConnect()

    try {
        const {name, username, email, password} = await request.json()
        const isVerifiedUserWithUsernameExist = await UserModel.findOne({
            username,
            isVerified: true
        })

        if(isVerifiedUserWithUsernameExist){
            return Response.json({
                success: false,
                message: "User with username already exists"
            },{status: 400})
        }

        const isUserWithEmailExist = await UserModel.findOne({
            email
        })

        const verifyCode = (Math.floor(Math.random() * 900000) + 100000).toString();

        if(isUserWithEmailExist){
            if(isUserWithEmailExist.isVerified){
                return Response.json({
                    success: false,
                    message: "User with email already exists"
                },{status: 400})
            }
            else{
                isUserWithEmailExist.name = name
                isUserWithEmailExist.username = username
                isUserWithEmailExist.password = await bcrypt.hash(password,10)
                isUserWithEmailExist.verifyCode = verifyCode
                isUserWithEmailExist.verifyCodeExpirey = new Date(Date.now()+3600000)
                
                await isUserWithEmailExist.save()
                const verificationEmail = await sendVerificationEmail(email,name,verifyCode)

                if(!verificationEmail.success){
                    return Response.json({
                        success: false,
                        message: verificationEmail.message
                    },{status: 400})
                }
                return Response.json({
                    success: true,
                    message: "New Verification code has been sent Please verify "
                },{status: 200})

            }
        }
        else{
            
            const hashedPassword = await bcrypt.hash(password,10)
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                name,
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpirey: expiryDate,
                isVerified: false,
                createdAt: Date.now(),
                
            })

            await newUser.save()

            // send Verification email

            const verificationEmail = await sendVerificationEmail(email,name,verifyCode)
                console.log(verificationEmail)
                if(!verificationEmail.success){
                    return Response.json({
                        success: false,
                        message: verificationEmail.message
                    },{status: 400})
                }
                return Response.json({
                    success: true,
                    message: "Verification code has been sent please verify"
                },{status: 200})
        }
    } catch (error) {
        console.error("Error signing  up user: ",error)
        return Response.json({
            success: false,
            message: "Error while singing up user"
        },{status: 500})
    }
}
