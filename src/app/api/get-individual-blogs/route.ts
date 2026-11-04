import BlogModel from "@/model/Blog.model";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import UserModel from "@/model/User.model";
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !mongoose.isValidObjectId(id))
    return Response.json(
      { success: false, message: "Invalid recipe." },
      { status: 400 },
    );
  try {
    await dbConnect();
    const blog = await BlogModel.findById(id).lean();
    if (!blog)
      return Response.json(
        { success: false, message: "This recipe is no longer available." },
        { status: 404 },
      );
    const owner = await UserModel.findById(blog.ownedById)
      .select("username")
      .lean();
    return Response.json({
      success: true,
      data: blog,
      owner: owner?.username || "Community cook",
    });
  } catch {
    return Response.json(
      { success: false, message: "Unable to load recipe. Please try again." },
      { status: 503 },
    );
  }
}
