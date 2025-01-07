import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog.model";
import { NextResponse } from "next/server";

export async function GET() {
  // Establish database connection
  await dbConnect();

  try {
    // Fetch all blogs, sorted by `createdAt` in descending order
    const allBlogs = await BlogModel.find()
      .sort({ createdAt: -1 })
      .select({ _id: 1, title: 1, createdAt: 1 });

    // Check if blogs are retrieved
    if (!allBlogs || allBlogs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No blogs found.",
        },
        { status: 404 }
      );
    }

    // Return blogs as a successful response
    return Response.json(
      {
        success: true,
        data: allBlogs,
      },
      { status: 200 }
    );
  } catch (error: any) {
    // Handle errors gracefully
    console.error("Error fetching blogs:", error.message);

    return Response.json(
      {
        success: false,
        message: "Error fetching blogs. Please try again later.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
