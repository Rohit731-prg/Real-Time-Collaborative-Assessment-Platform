import mongoose from "mongoose";

const examAttemptSchema = new mongoose.Schema(
	{
		examSessionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ExamSession",
			required: [true, "Exam session is required"],
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
		status: {
			type: String,
			enum: ["in_progress", "submitted", "auto_submitted"],
			default: "in_progress",
		},
		startedAt: {
			type: Date,
			default: Date.now,
		},
		submittedAt: {
			type: Date,
			default: null,
		},
		score: {
			type: Number,
			min: [0, "Score cannot be negative"],
			default: 0,
		},
		totalMarks: {
			type: Number,
			required: [true, "Total marks are required"],
			min: [0, "Total marks cannot be negative"],
		},
		percentage: {
			type: Number,
			min: [0, "Percentage cannot be negative"],
			max: [100, "Percentage cannot exceed 100"],
			default: 0,
		},
		correctCount: {
			type: Number,
			min: [0, "Correct count cannot be negative"],
			default: 0,
		},
		incorrectCount: {
			type: Number,
			min: [0, "Incorrect count cannot be negative"],
			default: 0,
		},
		unansweredCount: {
			type: Number,
			min: [0, "Unanswered count cannot be negative"],
			default: 0,
		},
		rank: {
			type: Number,
			min: [1, "Rank must be at least 1"],
			default: null,
		},
		percentile: {
			type: Number,
			min: [0, "Percentile cannot be negative"],
			max: [100, "Percentile cannot exceed 100"],
			default: null,
		},
		topicPerformance: [
			{
				topic: {
					type: String,
					trim: true,
					required: [true, "Topic is required"],
				},
				attempted: {
					type: Number,
					min: [0, "Attempted count cannot be negative"],
					default: 0,
				},
				correct: {
					type: Number,
					min: [0, "Correct count cannot be negative"],
					default: 0,
				},
				score: {
					type: Number,
					min: [0, "Score cannot be negative"],
					default: 0,
				},
				accuracy: {
					type: Number,
					min: [0, "Accuracy cannot be negative"],
					max: [100, "Accuracy cannot exceed 100"],
					default: 0,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

examAttemptSchema.index({ examSessionId: 1, userId: 1 }, { unique: true });
examAttemptSchema.index({ examId: 1, score: -1 });

export const ExamAttempt = mongoose.model("ExamAttempt", examAttemptSchema);
