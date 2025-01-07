import mongoose, {Document, Schema} from "mongoose";

export interface Blog extends Document{
    ownedById: mongoose.Types.ObjectId,
    title: string,
    bodyOfBlog: string,
    createdAt: Date,
}

export const BlogSchema: Schema<Blog> = new Schema({
    ownedById:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    title: {
        type: String,
        required: true
    },
    
    bodyOfBlog:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now 
    }
})

const BlogModel = mongoose.models.Blog 
  ? (mongoose.models.Blog as mongoose.Model<Blog>) 
  : mongoose.model<Blog>("Blog", BlogSchema);
export default BlogModel