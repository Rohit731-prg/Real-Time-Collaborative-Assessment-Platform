import { create } from "zustand";
import toast from "react-hot-toast";
import { examApi } from "../Utils/Axios";

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

type Store = {
	exam: Exam | null;
	aiResponse: string | null;
	createExam: (data: ExamInput) => Promise<boolean>;
};

const useExamStore = create<Store>()((set) => ({
	exam: null,
	aiResponse: null,

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

			const response = examApi.post("/createExam", formData);

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
			set({ exam: res.data.exam, aiResponse: res.data.aiResponse });
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	},
}));

export default useExamStore;
