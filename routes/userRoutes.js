import express from "express";
import { createProfile, addRating, getProfile, updateProfile } from "../controllers/userController.js";

const router = express.Router();

router.post("/profile", createProfile)
router.patch("/profile", updateProfile)
router.post("/rating", addRating)
router.get("/profile/:id", getProfile)

export default router;  