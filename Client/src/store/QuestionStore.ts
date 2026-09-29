import { create } from "zustand";

export type GeneratedQuestion = {
	question: string;
	marks: number;
	expectedAnswer: string;
	topic: string;
	difficulty: "easy" | "medium" | "hard";
};

type Store = {
	questions: GeneratedQuestion[];
	setQuestions: (questions: GeneratedQuestion[]) => void;
	clearQuestions: () => void;
};

const useQuestionStore = create<Store>()((set) => ({
	questions: [],
	setQuestions: (questions) => set({ questions }),
	clearQuestions: () => set({ questions: [] }),
}));

export default useQuestionStore;
