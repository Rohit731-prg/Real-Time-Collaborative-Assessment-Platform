import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
	{
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: [true, "Course is required"],
			index: true,
		},
		name: {
			type: String,
			required: [true, "Room name is required"],
			trim: true,
		},
		description: {
			type: String,
			trim: true,
			default: "",
		},
		creatorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Student",
			required: [true, "Room creator is required"],
		},
		roomCode: {
			type: String,
			required: [true, "Room code is required"],
			unique: true,
			trim: true,
			uppercase: true,
			minlength: [6, "Room code must be at least 6 characters"],
			maxlength: [12, "Room code cannot exceed 12 characters"],
		},
		status: {
			type: String,
			enum: ["waiting", "exam", "completed", "closed"],
			default: "waiting",
			index: true,
		},
		maxParticipants: {
			type: Number,
			required: [true, "Maximum participants is required"],
			min: [2, "Maximum participants must be at least 2"],
			default: 50,
		},
		currentExamId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Exam",
			default: null,
		},
		settings: {
			allowChat: {
				type: Boolean,
				default: true,
			},
			allowLateJoin: {
				type: Boolean,
				default: false,
			},
			showLeaderboard: {
				type: Boolean,
				default: true,
			},
		},
	},
	{
		timestamps: true,
	}
);

roomSchema.index({ courseId: 1, status: 1 });

export const Room = mongoose.model("Room", roomSchema);
