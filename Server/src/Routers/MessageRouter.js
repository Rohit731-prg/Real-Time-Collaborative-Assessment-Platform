import express from "express";
import { getAllMessage } from "../Controllers/MessageController.js";
import { verifyToken } from "../Middleware/JWT.js";

const router = express.Router();

router.use(verifyToken);
router.post("/get", getAllMessage);

export default router;