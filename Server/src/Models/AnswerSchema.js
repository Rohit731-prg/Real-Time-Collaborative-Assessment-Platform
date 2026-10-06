import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: [true, "Question is required"],
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: [true, "Exam is required"],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: [true, "User is required"],
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: [true, "Room is required"],
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
});

answerSchema.index(
    { userId: 1, examId: 1, questionId: 1 },
    { unique: true }
);

export const Answer = mongoose.model("Answer", answerSchema);