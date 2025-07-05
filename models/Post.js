import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            default: "",
        },
        media: {
            type: [String],
            default: [],
        },
        likes: {
            type: Number,
            default: 0, // Initialize likes to 0
        },
        walletId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
