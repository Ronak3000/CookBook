import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { BlogVerificationSchema } from "@/schemas/blogVerificationSchema";
import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog.model";
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id)
      return Response.json(
        { success: false, message: "Please sign in to share a recipe." },
        { status: 401 },
      );
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, message: "Send a valid recipe." },
        { status: 400 },
      );
    }
    const parsed = BlogVerificationSchema.safeParse(body);
    if (!parsed.success)
      return Response.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 },
      );
    await dbConnect();
    const blog = await BlogModel.create({
      ...parsed.data,
      ownedById: session.user._id,
    });
    return Response.json({
      success: true,
      message: "Recipe shared.",
      id: String(blog._id),
    });
  } catch {
    return Response.json(
      {
        success: false,
        message: "Unable to share your recipe. Please try again.",
      },
      { status: 503 },
    );
  }
}
