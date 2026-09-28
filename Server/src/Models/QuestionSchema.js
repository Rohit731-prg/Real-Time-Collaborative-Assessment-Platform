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
		type: {
			type: String,
			enum: ["MCQ", "SAQ", "FIVE_MARK", "TEN_MARK"],
			required: [true, "Question type is required"],
		},
		questionText: {
			type: String,
			required: [true, "Question text is required"],
			trim: true,
		},
		options: [
			{
				key: {
					type: String,
					required: [true, "Option key is required"],
					trim: true,
				},
				text: {
					type: String,
					required: [true, "Option text is required"],
					trim: true,
				},
			},
		],
		correctAnswer: {
			type: String,
			trim: true,
			default: "",
		},
		expectedAnswer: {
			type: String,
			trim: true,
			default: "",
		},
		marks: {
			type: Number,
			required: [true, "Question marks are required"],
			min: [0, "Question marks cannot be negative"],
		},
		topic: {
			type: String,
			trim: true,
			default: "",
		},
		subtopic: {
			type: String,
			trim: true,
			default: "",
		},
		difficulty: {
			type: String,
			enum: ["easy", "medium", "hard"],
			default: "medium",
		},
		order: {
			type: Number,
			min: [0, "Question order cannot be negative"],
			default: 0,
		},
		explanation: {
			type: String,
			trim: true,
			default: "",
		},
		sourceReferences: {
			materialId: {
				type: String,
				trim: true,
				default: "",
			},
			pageNumber: {
				type: Number,
				min: [1, "Page number must be at least 1"],
				default: null,
			},
			chunkId: {
				type: String,
				trim: true,
				default: "",
			},
		},
		evaluation: {
			method: {
				type: String,
				enum: ["exact", "keyword", "semantic", "llm"],
				default: "exact",
			},
			rubric: {
				type: String,
				trim: true,
				default: "",
			},
		},
		generatedByAI: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

questionSchema.index({ examId: 1, order: 1 });

export const Question = mongoose.model("Question", questionSchema);
