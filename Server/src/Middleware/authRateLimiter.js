import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs: 3 * 60 * 1000,
    limit: 8,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes.",
    },
});

export const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OTP attempts. Please try again after 15 minutes.",
    },
});

export const forgotPasswordLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 3,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many password reset requests. Please try again after 15 minutes.",
    },
});

export const resetPasswordLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many password reset attempts. Please try again after 15 minutes.",
    },
});