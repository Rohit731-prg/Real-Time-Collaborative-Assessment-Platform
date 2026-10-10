import express from "express";
import { login, signup, optVerification, forgotPasswordGetEmail, resetPassword } from "../Controllers/StudentController.js";
import { loginLimiter, otpLimiter, forgotPasswordLimiter, resetPasswordLimiter } from "../Middleware/authRateLimiter.js";

const router = express.Router();

router.post("/register", signup);
router.post("/verify-otp", otpLimiter, optVerification);
router.post("/forgot-password", forgotPasswordLimiter, forgotPasswordGetEmail);
router.post("/reset-password", resetPasswordLimiter, resetPassword);
router.post("/login", loginLimiter, login);

export const studentRouter = router;