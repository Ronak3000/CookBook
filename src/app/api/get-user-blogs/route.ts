import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import { getRecipePage, parseRecipeQuery, RecipeQueryError } from '@/lib/recipePagination';
import mongoose from 'mongoose';
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const ownerId = session?.user?._id;
    if (!ownerId || !mongoose.isValidObjectId(ownerId)) return Response.json({ success: false, message: 'Please sign in to open your cookbook.' }, { status: 401 });
    const query = parseRecipeQuery(request.url);
    await dbConnect();
    return Response.json(await getRecipePage(query, ownerId), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof RecipeQueryError) return Response.json({ success: false, message: error.message }, { status: 400 });
    console.error('Personal cookbook unavailable');
    return Response.json({ success: false, message: 'Unable to load your cookbook. Please try again.' }, { status: 503 });
  }
}
