import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Student",
			required: [true, "User is required"],
		},
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: [true, "Course is required"],
		},
		role: {
			type: String,
			enum: ["student", "instructor"],
			default: "student",
		},
		status: {
			type: String,
			enum: ["active", "removed", "pending"],
			default: "pending",
		},
		joinedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ courseId: 1, status: 1 });

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
