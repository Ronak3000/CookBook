import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { getRecipePage, parseRecipeQuery, RecipeQueryError } from '@/lib/recipePagination';
import { recipeCategories } from '@/types/recipes';
import { cuisines, dietaryTags } from '@/types/recipeContent';
const searchSchema = z.object({
  searchWord: z.string().trim().max(100),
  cuisine: z.enum(['', ...cuisines]).default(''),
  diet: z.enum(['', ...dietaryTags]).default(''),
  maxMinutes: z.number().int().min(1).max(2880).optional(),
  limit: z.number().int().min(1).max(36).default(12),
  cursor: z.string().max(512).optional(),
  category: z.enum(recipeCategories).default('All recipes'),
});
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ success: false, message: 'Send a valid search request.' }, { status: 400 }); }
  const result = searchSchema.safeParse(body);
  if (!result.success) return Response.json({ success: false, message: 'Use a search of at most 100 characters and a limit from 1–36.' }, { status: 400 });
  try {
    const url = new URL(request.url);
    url.searchParams.set('q', result.data.searchWord);
    url.searchParams.set('limit', String(result.data.limit));
    url.searchParams.set('category', result.data.category);
    url.searchParams.set('cuisine', result.data.cuisine);
    url.searchParams.set('diet', result.data.diet);
    if (result.data.maxMinutes) url.searchParams.set('maxMinutes', String(result.data.maxMinutes));
    if (result.data.cursor) url.searchParams.set('cursor', result.data.cursor);
    const query = parseRecipeQuery(url.href);
    await dbConnect();
    return Response.json(await getRecipePage(query));
  } catch (error) {
    if (error instanceof RecipeQueryError) return Response.json({ success: false, message: error.message }, { status: 400 });
    return Response.json({ success: false, message: 'Unable to search recipes. Please try again.' }, { status: 503 });
  }
}
