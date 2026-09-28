import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Course name is required"],
			trim: true,
		},
		code: {
			type: String,
			required: [true, "Course code is required"],
			trim: true,
			uppercase: true,
		},
		university: {
			type: String,
			required: [true, "University is required"],
			trim: true,
		},
		department: {
			type: String,
			required: [true, "Department is required"],
			trim: true,
		},
		semester: {
			type: Number,
			required: [true, "Semester is required"],
			min: [1, "Semester must be at least 1"],
		},
		description: {
			type: String,
			trim: true,
			default: "",
		},
		creatorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Course creator is required"],
			index: true,
		},
		syllabus: {
			type: String,
			trim: true,
			default: "",
		},
		status: {
			type: String,
			enum: ["draft", "active", "archived"],
			default: "draft",
			index: true,
		},
	},
	{
		timestamps: true,
	}
);

courseSchema.index({ university: 1, program: 1, code: 1 });

export const Course = mongoose.model("Course", courseSchema);
