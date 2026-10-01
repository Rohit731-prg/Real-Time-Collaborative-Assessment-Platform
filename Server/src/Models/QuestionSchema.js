import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
	{
		examId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Exam",
			required: [true, "Exam is required"],
		},
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: [true, "Course is required"],
		},
		createrId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Student",
			required: [true, "Question creater is required"],
		},
		type: {
			type: String,
			required: [true, "Question type is required"],
		},
		questionText: {
			type: Array,
			required: [true, "Question text is required"],
			trim: true,
		},
		attempted: {
			type: Boolean,
			default: false,
		}
	}, {
	timestamps: true,
}
);

questionSchema.index({ examId: 1, order: 1 });

export const Question = mongoose.model("Question", questionSchema);
