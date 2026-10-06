import express from "express";
import { login, signup, optVerification, forgotPasswordGetEmail, resetPassword } from "../Controllers/StudentController.js";

const router = express.Router();

router.post("/register", signup);
router.post("/verify-otp", optVerification);
router.post("/forgot-password", forgotPasswordGetEmail);
router.post("/reset-password", resetPassword);
router.post("/login", login);

export const studentRouter = router;