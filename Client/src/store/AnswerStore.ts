import { create } from "zustand";

export type StudentAnswers = Record<number, string>;

export type QuestionEvaluation = {
	question: string;
	correctAnswer: string;
	studentAnswer: string;
	marks: number;
	comment: string;
};

export type ExamSubmissionResult = {
	overview: string;
	results: QuestionEvaluation[];
	examTitle: string;
	totalMarks: number;
	roomCode: string;
};

type AnswerStore = {
	answers: StudentAnswers;
	submissionResult: ExamSubmissionResult | null;

	setAnswer: (questionIndex: number, answer: string) => void;
	setAnswers: (answers: StudentAnswers) => void;
	setSubmissionResult: (result: ExamSubmissionResult | null) => void;
	clearAnswers: () => void;
};

const useAnswerStore = create<AnswerStore>()((set) => ({
	answers: {},
	submissionResult: null,

	setAnswer: (questionIndex, answer) =>
		set((state) => ({
			answers: { ...state.answers, [questionIndex]: answer },
		})),
	setAnswers: (answers) => set({ answers }),
	setSubmissionResult: (result) => set({ submissionResult: result }),
	clearAnswers: () => set({ answers: {}, submissionResult: null }),
}));

export default useAnswerStore;
