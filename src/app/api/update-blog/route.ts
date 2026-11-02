import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import BlogModel from '@/model/Blog.model';
import dbConnect from '@/lib/dbConnect';
import { BlogVerificationSchema } from '@/schemas/blogVerificationSchema';
import mongoose from 'mongoose';
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) return Response.json({ success: false, message: 'Please sign in to edit a recipe.' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id || !mongoose.isValidObjectId(id)) return Response.json({ success: false, message: 'Invalid recipe.' }, { status: 400 });
  try {
    const parsed = BlogVerificationSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    await dbConnect();
    const blog = await BlogModel.findOneAndUpdate({ _id: id, ownedById: session.user._id }, parsed.data, { new: true, runValidators: true });
    if (!blog) return Response.json({ success: false, message: 'Recipe not found in your cookbook.' }, { status: 404 });
    return Response.json({ success: true, message: 'Recipe updated.' });
  } catch { return Response.json({ success: false, message: 'Unable to update your recipe.' }, { status: 503 }); }
}
