import { create } from "zustand";
import { courseApi } from "../Utils/Axios";
import toast from "react-hot-toast";

type CourseInput = {
	name: string;
	code: string;
	description?: string;
};

export type Course = {
	_id: string;
	name: string;
	code: string;
	description: string;
	university: string;
	semester: number;
	department: string;
	creatorId: string;
};

type Store = {
	courses: Course[];
	createCourse: (data: CourseInput) => Promise<boolean>;
	getAllCourse: () => Promise<boolean>;
	updateCourse: (id: string, data: CourseInput) => Promise<boolean>;
	deleteCourse: (id: string) => Promise<boolean>;
};

const useCourseStore = create<Store>()((set) => ({
	courses: [],

	createCourse: async (data: CourseInput) => {
		try {
			const response = courseApi.post("/create", data);

			toast.promise(response, {
				loading: "Creating course...",
				success: (res) =>
					res.data.message || "Course created successfully",
				error: (err) =>
					err.response?.data?.message ||
					err.message ||
					"Internal Server Error",
			});

			const res = await response;
			set((state) => ({
				courses: [...state.courses, res.data.course],
			}));

			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	},

	getAllCourse: async () => {
		try {
			const response = courseApi.get("/get");

			toast.promise(response, {
				loading: "Loading courses...",
				success: "Courses loaded",
				error: (err) =>
					err.response?.data?.message ||
					err.message ||
					"Internal Server Error",
			});

			const res = await response;
			set({ courses: res.data.courses });
            console.log(res.data);
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	},

	updateCourse: async (id: string, data: CourseInput) => {
		try {
			const response = courseApi.put(`/update/${id}`, data);

			toast.promise(response, {
				loading: "Updating course...",
				success: (res) => res.data.message || "Course updated successfully",
				error: (err) =>
					err.response?.data?.message ||
					err.message ||
					"Internal Server Error",
			});

			const res = await response;
			set((state) => ({
				courses: state.courses.map((course) =>
					course._id === id ? res.data.updatedCourse : course
				),
			}));

			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	},

	deleteCourse: async (id: string) => {
		try {
			const response = courseApi.delete(`/delete/${id}`);

			toast.promise(response, {
				loading: "Deleting course...",
				success: (res) => res.data.message || "Course deleted successfully",
				error: (err) =>
					err.response?.data?.message ||
					err.message ||
					"Internal Server Error",
			});

			await response;
			set((state) => ({
				courses: state.courses.filter((course) => course._id !== id),
			}));

			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	},
}));

export default useCourseStore;