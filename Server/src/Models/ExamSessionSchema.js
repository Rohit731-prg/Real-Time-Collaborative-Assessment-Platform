import mongoose from "mongoose";

const examSessionSchema = new mongoose.Schema(
	{
		examId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Exam",
			required: [true, "Exam is required"],
		},
		roomId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Room",
			required: [true, "Room is required"],
		},
		startedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Student",
			required: [true, "Session starter is required"],
		},
		status: {
			type: String,
			enum: ["waiting", "active", "paused", "completed"],
			default: "waiting",
			index: true,
		},
		scheduledAt: {
			type: Date,
			default: null,
		},
		startedAt: {
			type: Date,
			default: null,
		},
		endedAt: {
			type: Date,
			default: null,
		},
		serverStartTime: {
			type: Date,
			default: null,
		},
		durationSeconds: {
			type: Number,
			min: [0, "Duration cannot be negative"],
			default: 0,
		},
		participantCount: {
			type: Number,
			min: [0, "Participant count cannot be negative"],
			default: 0,
		},
		settings: {
			shuffleQuestions: {
				type: Boolean,
				default: false,
			},
			shuffleOptions: {
				type: Boolean,
				default: false,
			},
			showResultImmediately: {
				type: Boolean,
				default: false,
			},
			showLeaderboard: {
				type: Boolean,
				default: false,
			},
			allowReview: {
				type: Boolean,
				default: true,
			},
		},
	},
	{
		timestamps: true,
	}
);

examSessionSchema.index({ roomId: 1 }, {
	unique: true,
	partialFilterExpression: { status: "active" },
});
examSessionSchema.index({ examId: 1, createdAt: -1 });

export const ExamSession = mongoose.model("ExamSession", examSessionSchema);
