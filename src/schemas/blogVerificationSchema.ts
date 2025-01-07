import {z} from "zod"
export const BlogVerificationSchema = z.object({
    title: z.string().min(3,"Title Must be at least 3 letters long").trim(),
    // dishImageUrl: z.string(),
    bodyOfBlog: z.string(),
})