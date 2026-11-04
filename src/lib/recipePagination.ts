import mongoose, { FilterQuery } from "mongoose";
import { z } from "zod";
import BlogModel, { Blog } from "@/model/Blog.model";
import { recipeCategories } from "@/types/recipes";
import { cuisines, dietaryTags } from "@/types/recipeContent";
const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(36).default(12),
  q: z.string().trim().max(100).default(""),
  category: z.enum(recipeCategories).default("All recipes"),
  cuisine: z.enum(["", ...cuisines]).default(""),
  diet: z.enum(["", ...dietaryTags]).default(""),
  maxMinutes: z.coerce.number().int().min(1).max(2880).optional(),
  cursor: z.string().max(512).optional(),
});
const cursorSchema = z
  .object({
    date: z.string().datetime(),
    id: z.string().regex(/^[a-f\d]{24}$/i),
  })
  .strict();
const categoryTerms = {
  "Quick & easy": /quick|easy|minute|simple/i,
  Vegetarian: /veget|salad|paneer|tofu|lentil|mushroom/i,
  "Comfort food": /pasta|soup|rice|curry|stew/i,
  "Sweet treats": /sweet|cake|dessert|cookie|chocolate/i,
};
const totalMinutes = {
  $add: [
    { $ifNull: ["$recipe.prepMinutes", 0] },
    { $ifNull: ["$recipe.cookMinutes", 0] },
  ],
};
export class RecipeQueryError extends Error {}
export function parseRecipeQuery(url: string) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(new URL(url).searchParams),
  );
  if (!parsed.success)
    throw new RecipeQueryError(
      "Choose valid recipe filters, a search up to 100 characters, and a limit from 1–36.",
    );
  const { cursor, ...query } = parsed.data;
  if (!cursor) return { ...query, after: null };
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(cursor)) throw new Error();
    return {
      ...query,
      after: cursorSchema.parse(
        JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")),
      ),
    };
  } catch {
    throw new RecipeQueryError(
      "This recipe cursor is invalid. Refresh the collection to start again.",
    );
  }
}
export async function getRecipePage(
  query: ReturnType<typeof parseRecipeQuery>,
  ownerId?: string,
) {
  const conditions: FilterQuery<Blog>[] = [];
  if (ownerId)
    conditions.push({ ownedById: new mongoose.Types.ObjectId(ownerId) });
  if (query.q) {
    const match = {
      $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
    conditions.push({
      $or: [{ title: match }, { "recipe.ingredients.name": match }],
    });
  }
  if (query.cuisine) conditions.push({ "recipe.cuisine": query.cuisine });
  if (query.diet)
    conditions.push({
      "recipe.dietaryTags":
        query.diet === "Vegetarian"
          ? { $in: ["Vegetarian", "Vegan"] }
          : query.diet,
    });
  if (query.maxMinutes)
    conditions.push({
      recipe: { $exists: true },
      $expr: { $lte: [totalMinutes, query.maxMinutes] },
    });
  if (query.category !== "All recipes") {
    const structured =
      query.category === "Quick & easy"
        ? { recipe: { $exists: true }, $expr: { $lte: [totalMinutes, 30] } }
        : query.category === "Vegetarian"
          ? { "recipe.dietaryTags": { $in: ["Vegetarian", "Vegan"] } }
          : { "recipe.category": query.category };
    conditions.push({
      $or: [
        structured,
        { recipe: { $exists: false }, title: categoryTerms[query.category] },
      ],
    });
  }
  if (query.after) {
    const date = new Date(query.after.date);
    conditions.push({
      $or: [
        { createdAt: { $lt: date } },
        {
          createdAt: date,
          _id: { $lt: new mongoose.Types.ObjectId(query.after.id) },
        },
      ],
    });
  }
  const rows = await BlogModel.find(
    conditions.length ? { $and: conditions } : {},
  )
    .sort({ createdAt: -1, _id: -1 })
    .select({
      _id: 1,
      title: 1,
      createdAt: 1,
      "recipe.servings": 1,
      "recipe.prepMinutes": 1,
      "recipe.cookMinutes": 1,
      "recipe.cuisine": 1,
      "recipe.dietaryTags": 1,
    })
    .limit(query.limit + 1)
    .maxTimeMS(5000)
    .lean();
  const hasMore = rows.length > query.limit,
    data = rows.slice(0, query.limit),
    last = data.at(-1);
  const nextCursor =
    hasMore && last
      ? Buffer.from(
          JSON.stringify({
            date: new Date(last.createdAt).toISOString(),
            id: String(last._id),
          }),
        ).toString("base64url")
      : null;
  return {
    success: true,
    data,
    pagination: { hasMore, nextCursor, limit: query.limit },
  };
}
