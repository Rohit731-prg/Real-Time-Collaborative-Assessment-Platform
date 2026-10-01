import express from "express";
import { createExam, getActiveExamForRoom, submitExam } from "../Controllers/ExamController.js";
import { verifyToken } from "../Middleware/JWT.js";
import { upload } from "../Middleware/multer.js";

const router = express.Router();

router.use(verifyToken)
router.post("/createExam", upload.single("file"), createExam);
router.get("/room/:roomCode/active", getActiveExamForRoom);
router.post("/submitExam", submitExam);

export default router;