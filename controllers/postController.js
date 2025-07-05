import asyncHandler from "../helper/async.js";
import give_response from "../helper/help.js";
import Post from "../models/Post.js";

export const createPost = asyncHandler(async (req, res, next) => {
    try {
        const { description, media, walletId } = req.body;
        const post = await Post.create({ description, media, walletId });

        give_response(res, 200, true, "Post create successfully!", { post });
    } catch (error) {
        next(error);
    }
});

export const addLike = asyncHandler(async (req, res, next) => {
    try {
        const { postId } = req.body;
        const post = await Post.findOneAndUpdate(
            { _id: postId },
            { $inc: { likes: 1 } },  // Increment the "likes" field
            // { $inc: { likes: -1 } }, // Decrease the "likes" field
            { new: true }
        );

        give_response(res, 200, true, "Like add successfully!", { post });
    } catch (error) {
        next(error);
    }
});

export const getAllPost = asyncHandler(async (req, res, next) => {
    try {
        const posts = await Post.find({});

        give_response(res, 200, true, "Posts get successfully!", { posts });
    } catch (error) {
        next(error);
    }
});