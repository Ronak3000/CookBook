import mongoose, { FilterQuery } from 'mongoose';
import { z } from 'zod';
import BlogModel, { Blog } from '@/model/Blog.model';
import { recipeCategories } from '@/types/recipes';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(36).default(12),
  q: z.string().trim().max(100).default(''),
  category: z.enum(recipeCategories).default('All recipes'),
  cursor: z.string().max(512).optional(),
});
const cursorSchema = z.object({ date: z.string().datetime(), id: z.string().regex(/^[a-f\d]{24}$/i) }).strict();
const categoryTerms = {
  'Quick & easy': /quick|easy|minute|simple/i,
  Vegetarian: /veget|salad|paneer|tofu|lentil|mushroom/i,
  'Comfort food': /pasta|soup|rice|curry|stew/i,
  'Sweet treats': /sweet|cake|dessert|cookie|chocolate/i,
};
export class RecipeQueryError extends Error {}

export function parseRecipeQuery(url: string) {
  const params = new URL(url).searchParams;
  const parsed = querySchema.safeParse(Object.fromEntries(params));
  if (!parsed.success) throw new RecipeQueryError('Use a limit from 1–36, a search of at most 100 characters, and a valid category.');
  const { cursor, ...query } = parsed.data;
  if (!cursor) return { ...query, after: null };
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(cursor)) throw new Error();
    const after = cursorSchema.parse(JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')));
    return { ...query, after };
  } catch { throw new RecipeQueryError('This recipe cursor is invalid. Refresh the collection to start again.'); }
}

export async function getRecipePage(query: ReturnType<typeof parseRecipeQuery>, ownerId?: string) {
  const conditions: FilterQuery<Blog>[] = [];
  if (ownerId) conditions.push({ ownedById: new mongoose.Types.ObjectId(ownerId) });
  if (query.q) {
    // Preserve literal substring search: user punctuation must never become regex operators.
    conditions.push({ title: { $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } });
  }
  if (query.category !== 'All recipes') conditions.push({ title: categoryTerms[query.category] });
  if (query.after) {
    const date = new Date(query.after.date);
    conditions.push({ $or: [{ createdAt: { $lt: date } }, { createdAt: date, _id: { $lt: new mongoose.Types.ObjectId(query.after.id) } }] });
  }
  // The extra row tells us whether there is another page without a collection-wide count.
  const rows = await BlogModel.find(conditions.length ? { $and: conditions } : {})
    .sort({ createdAt: -1, _id: -1 })
    .select({ _id: 1, title: 1, createdAt: 1 })
    .limit(query.limit + 1).maxTimeMS(5000).lean();
  const hasMore = rows.length > query.limit;
  const data = rows.slice(0, query.limit);
  const last = data.at(-1);
  const nextCursor = hasMore && last ? Buffer.from(JSON.stringify({ date: new Date(last.createdAt).toISOString(), id: String(last._id) })).toString('base64url') : null;
  return { success: true, data, pagination: { hasMore, nextCursor, limit: query.limit } };
}
