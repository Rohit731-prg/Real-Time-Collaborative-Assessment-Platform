import { create } from "zustand";
import toast from "react-hot-toast";
import { examApi } from "../Utils/Axios";
import useQuestionStore, { type GeneratedQuestion } from "./QuestionStore";

type ExamInput = {
	courseId: string;
	roomCode: string;
	title: string;
	durationMinutes: number;
	totalMarks: number;
	file: File;
};

export type Exam = {
	_id: string;
	courseId: string;
	roomId: string;
	title: string;
	durationMinutes: number;
	totalMarks: number;
};

type CreateExamResponse = {
	message: string;
	exam: Exam;
	question: {
		questionText: GeneratedQuestion[] | string;
	};
};

type Store = {
	exam: Exam | null;
	createExam: (data: ExamInput) => Promise<boolean>;
};

const parseGeneratedQuestions = (response: unknown): GeneratedQuestion[] => {
	let parsedResponse = response;
	if (typeof parsedResponse === "string") {
		try {
			parsedResponse = JSON.parse(parsedResponse) as unknown;
		} catch {
			return [];
		}
	}

	return Array.isArray(parsedResponse)
		? (parsedResponse as GeneratedQuestion[])
		: [];
};

const useExamStore = create<Store>()((set) => ({
	exam: null,

	createExam: async (data: ExamInput) => {
		try {
			const formData = new FormData();
			formData.append("courseId", data.courseId);
			formData.append("roomCode", data.roomCode);
			formData.append("title", data.title);
			formData.append("durationMinutes", String(data.durationMinutes));
			formData.append("totalMarks", String(data.totalMarks));
			formData.append("file", data.file);

			console.log([...formData.entries()]);

			const response = examApi.post<CreateExamResponse>(
				"/createExam",
				formData
			);

			toast.promise(response, {
				loading: "Creating exam...",
				success: (res) =>
					res.data.message || "Exam created successfully",
				error: (err) =>
					err.response?.data?.message ||
					err.message ||
					"Internal Server Error",
			});

			const res = await response;
			useQuestionStore
				.getState()
				.setQuestions(
					parseGeneratedQuestions(res.data.question.questionText)
				);
			set({ exam: res.data.exam });
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	},
}));

export default useExamStore;
