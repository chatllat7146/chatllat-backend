import express from "express";
import {
    createPost,
    addLike,
    getAllPost
} from "../controllers/postController.js";
const router = express.Router();

router.post("/create", createPost);
router.post("/add/like", addLike);
router.get("/get/all", getAllPost);

export default router;
