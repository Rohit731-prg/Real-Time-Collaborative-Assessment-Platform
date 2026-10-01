import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../Utils/Axios";
import { toast } from "react-hot-toast";

export type StudentProfile = {
    _id: string;
    name: string;
    email: string;
    university: string;
    department: string;
    semester: number;
};

type SignupIn = {
    name: string;
    email: string;
    password: string;
    university: string;
    department: string;
    semester: number;
};

type Store = {
    currentUser: StudentProfile | null;

    signUp: (data: SignupIn) => Promise<boolean>;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
};

const useStudentStore = create<Store>()(
    persist(
        (set) => ({
            currentUser: null,

            signUp: async (data: SignupIn) => {
                try {
                    const res = api.post("/register", data);

                    toast.promise(res, {
                        loading: "Registering...",
                        success: (res) =>
                            res.data.message || "Registration complete",
                        error: (err) =>
                            err.response?.data?.message ||
                            err.message ||
                            "Internal Server Error",
                    });

                    const response = await res;

                    console.log(response);

                    set({
                        currentUser: response?.data?.student,
                    });

                    return true;
                } catch (error) {
                    console.log(error);
                    return false;
                }
            },

            login: async (email: string, password: string) => {
                try {
                    const res = api.post("/login", {
                        email: email.trim().toLowerCase(),
                        password,
                    });

                    toast.promise(res, {
                        loading: "Logging in...",
                        success: (res) =>
                            res.data.message || "Login successful",
                        error: (err) =>
                            err.response?.data?.message ||
                            err.message ||
                            "Internal Server Error",
                    });

                    const response = await res;

                    console.log(response);

                    set({
                        currentUser: response?.data?.student,
                    });
                    console.log(response?.data?.student)
                    return true;
                } catch (error) {
                    console.log(error);
                    return false;
                }
            },

            logout: () => {
                set({
                    currentUser: null,
                });
            },
        }),
        {
            name: "assessment-student-store",

            partialize: (state) => ({
                currentUser: state.currentUser,
            }),
        }
    )
);

export default useStudentStore;