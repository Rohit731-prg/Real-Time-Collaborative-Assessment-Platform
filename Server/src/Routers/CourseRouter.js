import express from "express";
import { createCourse, getAllCourse, updateCourse, deleteCourse } from "../Controllers/CourseController.js";
import { verifyToken } from "../Middleware/JWT.js";

const router = express.Router();

router.use(verifyToken);
router.post("/create", createCourse);
router.get("/get", getAllCourse);
router.put("/update/:id", updateCourse);
router.delete("/delete/:id", deleteCourse);

export const courseRouter = router;