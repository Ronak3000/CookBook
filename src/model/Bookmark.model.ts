import mongoose, { Schema } from "mongoose";
const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  recipeId: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
});
schema.index({ userId: 1, recipeId: 1 }, { unique: true });
schema.index({ userId: 1, createdAt: -1, _id: -1 });
const BookmarkModel =
  mongoose.models.Bookmark || mongoose.model("Bookmark", schema);
export default BookmarkModel;
