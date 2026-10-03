import mongoose, { Schema } from "mongoose";

const aiChatSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true,
    },
    examId: {
        type: Schema.Types.ObjectId,
        ref: "Exam",
        required: true,
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    roomId: {
        type: Schema.Types.ObjectId,
        ref: "Room",
        required: true,
    },
    Message: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "ai"],
        required: true,
    },
}, {
    timestamps: true
});

export const AiChat = mongoose.model("AiChat", aiChatSchema);