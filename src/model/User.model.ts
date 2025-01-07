import mongoose, { Schema , Document} from "mongoose";


export interface User extends Document {
    name: string;
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpirey: Date;
    isVerified: boolean;
    
    createdAt: Date;
   
}

export const UserSchema : Schema<User> = new Schema({
    name:{
        type:String,
        required: true,
    },
    username:{
        type:String,
        required: [true,"Username is required"],
        trim: true,
        unique: true,
    },
    email: {
        type:String,
        required: [true,"Email is required"],
        trim: true,
        unique: true,
        match:  [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g, "Please use a valid email"]

    },
    password: {
        type:String,
        required: [true,"Password is required"],
    },
    verifyCode: {
        type: String,
        required: true
    },
    verifyCodeExpirey:{
        type: Date,
        required: true
    },
    isVerified:{
        type: Boolean,
        default: false,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    
})

const UserModel = mongoose.models.User
  ? (mongoose.models.User as mongoose.Model<User>) 
  : mongoose.model<User>("User", UserSchema);
export default UserModel