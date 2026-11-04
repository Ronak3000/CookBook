import { z } from "zod";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import BlogModel from "@/model/Blog.model";
import ShoppingGroupModel from "@/model/ShoppingGroup.model";
import {
  kitchenUser,
  kitchenUnauthorized,
  kitchenFailure,
  privateHeaders,
} from "@/lib/kitchenAuth";
import { parseRecipeQuery, RecipeQueryError } from "@/lib/recipePagination";
import { scaleQuantity } from "@/types/recipeContent";
const idSchema = z.string().regex(/^[a-f\d]{24}$/i);
export async function GET(request: Request) {
  try {
    const userId = await kitchenUser();
    if (!userId) return kitchenUnauthorized();
    const query = parseRecipeQuery(request.url);
    await dbConnect();
    const filter = {
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
    const rows = await ShoppingGroupModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(query.limit + 1)
      .select("-userId")
      .lean();
    const data = rows.slice(0, query.limit),
      last = data.at(-1),
      hasMore = rows.length > query.limit;
    const nextCursor =
      hasMore && last
        ? Buffer.from(
            JSON.stringify({
              date:
                last.createdAt instanceof Date
                  ? last.createdAt.toISOString()
                  : new Date(String(last.createdAt)).toISOString(),
              id: String(last._id),
            }),
          ).toString("base64url")
        : null;
    return Response.json(
      {
        success: true,
        data,
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
    const parsed = z
      .object({
        recipeId: idSchema,
        servings: z.number().int().min(1).max(100),
      })
      .safeParse(await request.json().catch(() => null));
    if (!parsed.success)
      return Response.json(
        { success: false, message: "Choose a recipe and 1–100 servings." },
        { status: 400 },
      );
    await dbConnect();
    const blog = await BlogModel.findById(parsed.data.recipeId);
    if (!blog?.recipe)
      return Response.json(
        {
          success: false,
          message:
            "This recipe needs structured ingredients before it can be added to a shopping list.",
        },
        { status: 400 },
      );
    const items = blog.recipe.ingredients.map((item) => ({
      name: item.name,
      unit: item.unit,
      quantity: scaleQuantity(
        item.quantity,
        blog.recipe!.servings,
        parsed.data.servings,
      ),
      checked: false,
    }));
    const group = await ShoppingGroupModel.findOneAndUpdate(
      { userId, recipeId: blog._id },
      { $set: { title: blog.title, servings: parsed.data.servings, items } },
      { upsert: true, new: true, runValidators: true },
    );
    return Response.json(
      {
        success: true,
        message: "Shopping list updated for your selected servings.",
        id: String(group._id),
      },
      { headers: privateHeaders },
    );
  } catch {
    return kitchenFailure();
  }
}
export async function PATCH(request: Request) {
  try {
    const userId = await kitchenUser();
    if (!userId) return kitchenUnauthorized();
    const parsed = z
      .object({ groupId: idSchema, itemId: idSchema, checked: z.boolean() })
      .safeParse(await request.json().catch(() => null));
    if (!parsed.success)
      return Response.json(
        { success: false, message: "Choose a valid shopping item." },
        { status: 400 },
      );
    await dbConnect();
    const result = await ShoppingGroupModel.updateOne(
      { _id: parsed.data.groupId, userId, "items._id": parsed.data.itemId },
      { $set: { "items.$.checked": parsed.data.checked } },
    );
    return result.matchedCount
      ? Response.json({ success: true })
      : Response.json(
          { success: false, message: "Shopping item not found." },
          { status: 404 },
        );
  } catch {
    return kitchenFailure();
  }
}
export async function DELETE(request: Request) {
  try {
    const userId = await kitchenUser();
    if (!userId) return kitchenUnauthorized();
    const id = new URL(request.url).searchParams.get("id");
    if (!idSchema.safeParse(id).success)
      return Response.json(
        { success: false, message: "Choose a valid shopping list." },
        { status: 400 },
      );
    await dbConnect();
    const result = await ShoppingGroupModel.deleteOne({ _id: id, userId });
    return result.deletedCount
      ? Response.json({ success: true })
      : Response.json(
          { success: false, message: "Shopping list not found." },
          { status: 404 },
        );
  } catch {
    return kitchenFailure();
  }
}
