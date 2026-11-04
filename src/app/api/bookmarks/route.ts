import { z } from "zod";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog.model";
import BookmarkModel from "@/model/Bookmark.model";
import {
  kitchenUser,
  kitchenUnauthorized,
  kitchenFailure,
  privateHeaders,
} from "@/lib/kitchenAuth";
import { parseRecipeQuery, RecipeQueryError } from "@/lib/recipePagination";
const idSchema = z.string().regex(/^[a-f\d]{24}$/i);
export async function GET(request: Request) {
  try {
    const userId = await kitchenUser();
    if (!userId) return kitchenUnauthorized();
    const recipeId = new URL(request.url).searchParams.get("recipeId");
    if (recipeId && !idSchema.safeParse(recipeId).success)
      return Response.json(
        { success: false, message: "Invalid recipe." },
        { status: 400 },
      );
    const query = parseRecipeQuery(request.url);
    await dbConnect();
    if (recipeId)
      return Response.json(
        {
          success: true,
          saved: Boolean(await BookmarkModel.exists({ userId, recipeId })),
        },
        { headers: privateHeaders },
      );
    const match = {
      userId,
      ...(query.after
        ? {
            $or: [
              { createdAt: { $lt: new Date(query.after.date) } },
              {
                createdAt: new Date(query.after.date),
                _id: { $lt: new mongoose.Types.ObjectId(query.after.id) },
              },
            ],
          }
        : {}),
    };
    const rows = await BookmarkModel.aggregate([
      { $match: match },
      { $sort: { createdAt: -1, _id: -1 } },
      {
        $lookup: {
          from: "blogs",
          localField: "recipeId",
          foreignField: "_id",
          as: "recipe",
        },
      },
      { $unwind: "$recipe" },
      { $limit: query.limit + 1 },
      {
        $project: {
          _id: 0,
          bookmarkId: "$_id",
          savedAt: "$createdAt",
          recipe: {
            _id: "$recipe._id",
            title: "$recipe.title",
            createdAt: "$recipe.createdAt",
            recipe: {
              $cond: [
                { $ifNull: ["$recipe.recipe", false] },
                {
                  servings: "$recipe.recipe.servings",
                  prepMinutes: "$recipe.recipe.prepMinutes",
                  cookMinutes: "$recipe.recipe.cookMinutes",
                  cuisine: "$recipe.recipe.cuisine",
                  dietaryTags: "$recipe.recipe.dietaryTags",
                },
                "$$REMOVE",
              ],
            },
          },
        },
      },
    ]).option({ maxTimeMS: 5000 });
    const page = rows.slice(0, query.limit),
      last = page.at(-1),
      hasMore = rows.length > query.limit;
    const nextCursor =
      hasMore && last
        ? Buffer.from(
            JSON.stringify({
              date: last.savedAt.toISOString(),
              id: String(last.bookmarkId),
            }),
          ).toString("base64url")
        : null;
    return Response.json(
      {
        success: true,
        data: page.map((row) => row.recipe),
        pagination: { hasMore, nextCursor, limit: query.limit },
      },
      { headers: privateHeaders },
    );
  } catch (error) {
    if (error instanceof RecipeQueryError)
      return Response.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    return kitchenFailure();
  }
}
export async function POST(request: Request) {
  try {
    const userId = await kitchenUser();
    if (!userId) return kitchenUnauthorized();
    const body = await request.json().catch(() => null);
    const parsed = z
      .object({ recipeId: idSchema, saved: z.boolean() })
      .safeParse(body);
    if (!parsed.success)
      return Response.json(
        { success: false, message: "Choose a valid recipe to save." },
        { status: 400 },
      );
    await dbConnect();
    const filter = {
      userId,
      recipeId: new mongoose.Types.ObjectId(parsed.data.recipeId),
    };
    if (parsed.data.saved) {
      if (!(await BlogModel.exists({ _id: filter.recipeId })))
        return Response.json(
          { success: false, message: "This recipe is no longer available." },
          { status: 404 },
        );
      await BookmarkModel.updateOne(
        filter,
        { $setOnInsert: filter },
        { upsert: true },
      );
    } else await BookmarkModel.deleteOne(filter);
    return Response.json(
      { success: true, saved: parsed.data.saved },
      { headers: privateHeaders },
    );
  } catch {
    return kitchenFailure();
  }
}
