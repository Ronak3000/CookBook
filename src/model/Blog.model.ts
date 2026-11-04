import mongoose, { Document, Schema } from "mongoose";
import type { RecipeContent } from "@/types/recipeContent";
export interface Blog extends Document {
  ownedById: mongoose.Types.ObjectId;
  title: string;
  bodyOfBlog: string;
  createdAt: Date;
  recipe?: RecipeContent;
}
const RecipeSchema = new Schema(
  {
    ingredients: [
      {
        _id: false,
        name: { type: String, required: true },
        quantity: { type: Number, default: null },
        unit: { type: String, default: "" },
      },
    ],
    steps: [String],
    prepMinutes: Number,
    cookMinutes: Number,
    servings: Number,
    cuisine: String,
    dietaryTags: [String],
    category: String,
  },
  { _id: false },
);
export const BlogSchema = new Schema<Blog>({
  ownedById: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  title: { type: String, required: true },
  bodyOfBlog: { type: String, default: "" },
  recipe: { type: RecipeSchema, required: false, default: undefined },
  createdAt: { type: Date, default: Date.now },
});
BlogSchema.index({ createdAt: -1, _id: -1 });
BlogSchema.index({ ownedById: 1, createdAt: -1, _id: -1 });
const BlogModel =
  (mongoose.models.Blog as mongoose.Model<Blog>) ||
  mongoose.model<Blog>("Blog", BlogSchema);
export default BlogModel;
