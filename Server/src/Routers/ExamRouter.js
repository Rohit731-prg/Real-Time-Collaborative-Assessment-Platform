import express from "express";
import { createExam } from "../Controllers/ExamController.js";
import { verifyToken } from "../Middleware/JWT.js";
import { upload } from "../Middleware/multer.js";

const router = express.Router();

router.use(verifyToken)
router.post("/createExam", upload.single("file"), createExam);

export default router;