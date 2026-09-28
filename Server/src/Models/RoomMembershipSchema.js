import mongoose from "mongoose";

const roomMembershipSchema = new mongoose.Schema(
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
		role: {
			type: String,
			enum: ["creator", "participant"],
			default: "participant",
		},
		joinedAt: {
			type: Date,
			default: Date.now,
		},
		lastSeenAt: {
			type: Date,
			default: Date.now,
		},
		isOnline: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

roomMembershipSchema.index({ roomId: 1, userId: 1 }, { unique: true });

export const RoomMembership = mongoose.model("RoomMembership", roomMembershipSchema);