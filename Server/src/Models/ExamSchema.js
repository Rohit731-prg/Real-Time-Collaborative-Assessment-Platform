import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
	{
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: [true, "Course is required"],
		},
		roomId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Room",
			required: [true, "Room is required"],
		},
		title: {
			type: String,
			required: [true, "Exam title is required"],
			trim: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Student",
			required: [true, "Exam creator is required"],
		},
		durationMinutes: {
			type: Number,
			required: [true, "Exam duration is required"],
			min: [1, "Exam duration must be at least 1 minute"],
		},
		totalMarks: {
			type: Number,
			required: [true, "Total marks are required"],
			min: [0, "Total marks cannot be negative"],
		}
	}, {
	timestamps: true,
}
);

examSchema.index({ courseId: 1, status: 1 });
examSchema.index({ roomId: 1, status: 1 });

export const Exam = mongoose.model("Exam", examSchema);
