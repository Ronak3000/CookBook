import mongoose, { Schema, Document } from 'mongoose';
export interface User extends Document {
  name: string; username: string; email: string; password: string;
  isVerified: boolean; createdAt: Date;
}
const UserSchema = new Schema<User>({
  name: { type: String, required: true },
  username: { type: String, required: true, trim: true, unique: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', UserSchema);
export default UserModel;
