import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import {z} from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {

    try {

        const {searchParams} = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }
        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam)

        if(!result.success) {
            const usernameErrors = result.error.format().username?._errors || []

            return Response.json({success: false, message: usernameErrors?.length>0 ? usernameErrors.join(', '): "Invalid username"}, {status: 400})
        }

        const {username} = result.data

        await dbConnect()
        const existingVerifiedUser = await UserModel.findOne({username})

        if(existingVerifiedUser){
            return Response.json({success: false, message: "Username already exists"}, {status: 200})
        }

        return Response.json({success: true, message: "Username is unique"}, {status: 200})

    } catch (error) {
        console.error("Error checking username:", error);
        return Response.json({success: false, message: "Error checking username"}, {status: 500})
    }
}
