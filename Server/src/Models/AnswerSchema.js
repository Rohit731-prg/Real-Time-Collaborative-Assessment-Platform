import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    attemptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamAttempt",
        required: [true, "Exam attempt is required"],
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: [true, "Question is required"],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: [true, "User is required"],
    },
    answer: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    isCorrect: {
        type: Boolean,
        default: null,
    },
    marksAwarded: {
        type: Number,
        min: [0, "Marks awarded cannot be negative"],
        default: 0,
    },
    timeSpentSeconds: {
        type: Number,
        min: [0, "Time spent cannot be negative"],
        default: 0,
    },
    answeredAt: {
        type: Date,
        default: Date.now,
    },
    evaluation: {
        status: {
            type: String,
            enum: ["pending", "evaluated"],
            default: "pending",
        },
        method: {
            type: String,
            enum: ["exact", "keyword", "semantic", "llm"],
            default: "exact",
        },
        feedback: {
            type: String,
            trim: true,
            default: "",
        },
    },
}, {
    timestamps: true,
}
);

answerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });

export const Answer = mongoose.model("Answer", answerSchema);
