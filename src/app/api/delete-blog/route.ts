import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import BlogModel from '@/model/Blog.model';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) return Response.json({ success: false, message: 'Please sign in to delete a recipe.' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id || !mongoose.isValidObjectId(id)) return Response.json({ success: false, message: 'Invalid recipe.' }, { status: 400 });
  try {
    await dbConnect();
    const blog = await BlogModel.findOneAndDelete({ _id: id, ownedById: session.user._id });
    if (!blog) return Response.json({ success: false, message: 'Recipe not found in your cookbook.' }, { status: 404 });
    return Response.json({ success: true, message: 'Recipe deleted.' });
  } catch { return Response.json({ success: false, message: 'Unable to delete your recipe.' }, { status: 503 }); }
}
