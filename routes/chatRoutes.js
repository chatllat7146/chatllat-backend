import express from "express";
import { createGroupChat, getChatList, getChatMessages, getPersonalChatMessages } from "../controllers/chatController.js";

const router = express.Router();

router.post("/create/group_chat", createGroupChat);
router.get("/all/chatList", getChatList);
router.get("/personalChat/allMsg", getPersonalChatMessages);
router.get("/allMsg", getChatMessages);

export default router;