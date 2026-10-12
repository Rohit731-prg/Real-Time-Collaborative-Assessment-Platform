import express from "express";
import {
    login,
    signup,
    optVerification,
    forgotPasswordGetEmail,
    resetPassword,
    logout
} from "../Controllers/StudentController.js";
import {
    loginLimiter,
    otpLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter
} from "../Middleware/authRateLimiter.js";

const router = express.Router();

router.post("/register", signup);
router.post("/verify-otp", otpLimiter, optVerification);
router.post("/forgot-password", forgotPasswordLimiter, forgotPasswordGetEmail);
router.post("/reset-password", resetPasswordLimiter, resetPassword);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);

export const studentRouter = router;