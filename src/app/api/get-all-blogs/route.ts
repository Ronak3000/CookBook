import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const blogs = await BlogModel.find().sort({ createdAt: -1 })
      .select({ _id: 1, title: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    console.error("Recipe collection unavailable:", error instanceof Error ? error.message : "Connection failed");
    return NextResponse.json({ success: false, message: "The recipe collection is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
