import dbConnect from "@/lib/dbConnect";
import BlogModel, { Blog } from "@/model/Blog.model";
import { searchWordSchema } from "@/schemas/searchWordSchema";

export async function POST(request: Request) {
    await dbConnect()

    try {

        const {searchWord} = await request.json()
        
        const allBlogs = await BlogModel.find()
            .sort({ createdAt: -1 })
            .select({ _id: 1, title: 1, createdAt:1});

        if(!allBlogs){
            return Response.json({
                success: false,
                message: "No blogs found."
            }, {
                status: 404
            })
        }
        const trimmedSearchWord = searchWord.trim()
        const queryParam = {
            searchWord: trimmedSearchWord
        }
        // validate with zod
        const result = searchWordSchema.safeParse(queryParam)



        if(!result.success) {
            const usernameErrors = result.error.format().searchWord?._errors || []

            return Response.json({success: false, message: usernameErrors?.length>0 ? usernameErrors.join(', '): "Invalid search"}, {status: 400})
        }

        let searchSpecificBlogs = allBlogs
        if(trimmedSearchWord.length !== 0){
            searchSpecificBlogs = allBlogs.filter((blog: Blog)=>{
                if(blog.title.toLowerCase().includes(trimmedSearchWord.toLowerCase())) return blog
            })
        }
        

        if(!searchSpecificBlogs || searchSpecificBlogs.length === 0){
            return Response.json({
                success: false, 
                message: "No blogs found with the search word."
            }, {
                status: 404
            })
        } 

        return Response.json({
            success: true,
            data: searchSpecificBlogs,
            message: "Found related Blogs"
        },{status: 200})


    } catch (error) {
        return Response.json({
            success: false,
            message: `error getting Individual blogs: ${error}`
        },{status: 500})
    }
}