import mongoose, { Schema } from "mongoose";
const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  recipeId: { type: Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  servings: { type: Number, required: true },
  items: [
    {
      name: String,
      quantity: { type: Number, default: null },
      unit: String,
      checked: { type: Boolean, default: false },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});
schema.index({ userId: 1, recipeId: 1 }, { unique: true });
schema.index({ userId: 1, createdAt: -1, _id: -1 });
const ShoppingGroupModel =
  mongoose.models.ShoppingGroup || mongoose.model("ShoppingGroup", schema);
export default ShoppingGroupModel;
