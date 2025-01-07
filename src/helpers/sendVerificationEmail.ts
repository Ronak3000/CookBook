import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/ApiResponse";
import VerificationEmail from "../../emails/VerificationEmail";


export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<ApiResponse>{
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Cookbook | Verification Email',
            react: VerificationEmail({username, otp: verifyCode}),
        });
        return { success: true, message: "Verification email sent successfully" };
        
    } catch (error) {
        console.error("Error sending verification email:", error);
        return { success: false, message: "Error sending verification email" };
    }
}