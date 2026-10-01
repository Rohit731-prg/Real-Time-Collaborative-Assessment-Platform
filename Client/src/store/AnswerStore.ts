import { create } from "zustand";

export type StudentAnswers = Record<number, string>;

type AnswerStore = {
	answers: StudentAnswers;
	ai_response_overview: unknown | null;

	setAnswer: (questionIndex: number, answer: string) => void;
	setAnswers: (answers: StudentAnswers) => void;
	setAiResponseOverview: (overview: unknown | null) => void;
	clearAnswers: () => void;
};

const useAnswerStore = create<AnswerStore>()((set) => ({
	answers: {},
	ai_response_overview: null,

	setAnswer: (questionIndex, answer) =>
		set((state) => ({
			answers: { ...state.answers, [questionIndex]: answer },
		})),
	setAnswers: (answers) => set({ answers }),
	setAiResponseOverview: (overview) => set({ ai_response_overview: overview }),
	clearAnswers: () => set({ answers: {} }),
}));

export default useAnswerStore;
