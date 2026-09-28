import mongoose from "mongoose";

const discussionMessageSchema = new mongoose.Schema(
	{
		roomId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Room",
			required: [true, "Room is required"],
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Student",
			required: [true, "User is required"],
		},
		message: {
			type: String,
			required: [true, "Message is required"],
			trim: true,
		},
		// type: {
		// 	type: String,
		// 	enum: ["text", "system", "announcement"],
		// 	default: "text",
		// },
		// replyTo: {
		// 	type: mongoose.Schema.Types.ObjectId,
		// 	ref: "DiscussionMessage",
		// 	default: null,
		// },
	},
	{
		timestamps: true,
	}
);

discussionMessageSchema.index({ roomId: 1, createdAt: 1 });

export const DiscussionMessage = mongoose.model("DiscussionMessage", discussionMessageSchema);
