import { create } from "zustand";
import toast from "react-hot-toast";
import { examApi } from "../Utils/Axios";
import useAnswerStore, { type ExamSubmissionResult, type QuestionEvaluation } from "./AnswerStore";
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

export type ExamSubmission = {
	questionId: string;
	examId: string;
	roomCode: string;
	answer: string[];
};

type CreateExamResponse = {
	message: string;
	exam: Exam;
	question: {
		_id: string;
		questionText: GeneratedQuestion[] | string;
	};
};

type Store = {
	exam: Exam | null;
	questionId: string | null;
	loadExam: (exam: Exam, questionId: string, questions: unknown) => void;
	loadActiveExam: (roomCode: string) => Promise<boolean>;
	createExam: (data: ExamInput) => Promise<boolean>;
	submitExam: (data: ExamSubmission) => Promise<boolean>;
};

type ActiveExamResponse = {
	exam: Exam;
	question: {
		_id: string;
		questionText: GeneratedQuestion[] | string;
	};
	questions: GeneratedQuestion[] | string;
};

type SubmitExamResponse = {
	message: string;
	overview: string;
	results: QuestionEvaluation[];
	exam: {
		title: string;
		totalMarks: number;
	};
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
	questionId: null,
	loadExam: (exam, questionId, questions) => {
		useQuestionStore.getState().setQuestions(parseGeneratedQuestions(questions));
		set({ exam, questionId });
	},
	loadActiveExam: async (roomCode) => {
		try {
			const response = await examApi.get<ActiveExamResponse>(
				`/room/${encodeURIComponent(roomCode)}/active`
			);
			const { exam, question, questions } = response.data;
			useQuestionStore.getState().setQuestions(parseGeneratedQuestions(questions ?? question.questionText));
			set({ exam, questionId: question._id });
			return true;
		} catch (error) {
			console.error("Failed to load active exam:", error);
			return false;
		}
	},

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
			set({ exam: res.data.exam, questionId: res.data.question._id });
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	},

	submitExam: async (data: ExamSubmission) => {
		try {
			const response = examApi.post<SubmitExamResponse>("/submitExam", data);

			toast.promise(response, {
				loading: "Submitting assessment...",
				success: (res) => res.data.message || "Assessment submitted successfully",
				error: (err) =>
					err.response?.data?.message ||
					err.message ||
					"Assessment submission failed",
			});

			

			const result = await response;
			const submissionResult: ExamSubmissionResult = {
				overview: result.data.overview,
				results: result.data.results,
				examTitle: result.data.exam.title,
				totalMarks: result.data.exam.totalMarks,
				roomCode: data.roomCode,
			};
			useAnswerStore.getState().setSubmissionResult(submissionResult);
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	},
}));

export default useExamStore;
