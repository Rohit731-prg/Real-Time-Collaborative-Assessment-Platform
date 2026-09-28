import express from "express";
import { login, signup } from "../Controllers/StudentController.js";

const router = express.Router();

router.post("/register", signup)
router.post("/login", login)

export const studentRouter = router;