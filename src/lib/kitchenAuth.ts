import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import mongoose from "mongoose";
export async function kitchenUser() {
  const session = await getServerSession(authOptions);
  return session?.user?._id && mongoose.isValidObjectId(session.user._id)
    ? new mongoose.Types.ObjectId(session.user._id)
    : null;
}
export const kitchenUnauthorized = () =>
  Response.json(
    {
      success: false,
      message: "Please sign in to use your kitchen collection.",
    },
    { status: 401 },
  );
export const kitchenFailure = () =>
  Response.json(
    {
      success: false,
      message: "Unable to update your kitchen. Please try again.",
    },
    { status: 503 },
  );
export const privateHeaders = { "Cache-Control": "private, no-store" };
