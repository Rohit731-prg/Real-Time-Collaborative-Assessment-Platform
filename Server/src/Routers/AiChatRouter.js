import express from "express";
import { createAiChatResponse, getAiChat } from "../Controllers/AiChatController.js";
import { verifyToken } from "../Middleware/JWT.js";

const router = express.Router();

router.use(verifyToken);
router.post("/add", createAiChatResponse);
router.post("/get", getAiChat);

export default router;