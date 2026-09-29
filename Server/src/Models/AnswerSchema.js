import mongoose from "mongoose";
import { array } from "zod";

const answerSchema = new mongoose.Schema({
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
    answers: {
        type: Array,
        default: null,
    },
    timeSpentSeconds: {
        type: Number,
        min: [0, "Time spent cannot be negative"],
        default: 0,
    },
}, {
    timestamps: true,
}
);

answerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });

export const Answer = mongoose.model("Answer", answerSchema);
