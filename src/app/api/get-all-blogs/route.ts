import dbConnect from '@/lib/dbConnect';
import { getRecipePage, parseRecipeQuery, RecipeQueryError } from '@/lib/recipePagination';
export async function GET(request: Request) {
  try {
    const query = parseRecipeQuery(request.url);
    await dbConnect();
    return Response.json(await getRecipePage(query), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof RecipeQueryError) return Response.json({ success: false, message: error.message }, { status: 400 });
    console.error('Recipe collection unavailable');
    return Response.json({ success: false, message: 'The recipe collection is temporarily unavailable. Please try again shortly.' }, { status: 503 });
  }
}
