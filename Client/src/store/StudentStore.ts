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
    email: String | null
    currentUser: StudentProfile | null;

    signUp: (data: SignupIn) => Promise<boolean>;
    verifyOtp: (otp: string) => Promise<boolean>;
    login: (email: string, password: string) => Promise<boolean>;
    forgotPassword: (email: string) => Promise<boolean>;
    resetPassword: (email: string, otp: string, password: string) => Promise<boolean>;
    logout: () => void;
};

const useStudentStore = create<Store>()(
    persist(
        (set, get) => ({
            email: null,
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
                        email: response?.data?.email,
                    });

                    return true;
                } catch (error) {
                    console.log(error);
                    return false;
                }
            },

            verifyOtp: async (otp: string) => {
                try {
                    if (!get().email) {
                        toast.error("Email not found!");
                        return false;
                    }

                    const res = api.post("/verify-otp", {
                        email: String(get().email),
                        otp,
                    });

                    toast.promise(res, {
                        loading: "Verifying...",
                        success: (res) =>
                            res.data.message || "Verification successful",
                        error: (err) =>
                            err.response?.data?.message ||
                            err.message ||
                            "Internal Server Error",
                    });

                    const response = await res;

                    console.log(response);

                    set({
                        email: response?.data?.student.email,
                    });

                    return true;
                } catch (error) {
                    console.log({ error });
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

            forgotPassword: async (email: string) => {
                try {
                    const res = api.post("/forgot-password", {
                        email: email.trim().toLowerCase(),
                    });

                    toast.promise(res, {
                        loading: "Sending verification code...",
                        success: (res) =>
                            res.data.message || "OTP sent successfully",
                        error: (err) =>
                            err.response?.data?.message ||
                            err.message ||
                            "Internal Server Error",
                    });

                    const response = await res;
                    console.log(response);

                    set({
                        email: email.trim().toLowerCase(),
                    });

                    return true;
                } catch (error) {
                    console.log(error);
                    return false;
                }
            },

            resetPassword: async (email: string, otp: string, password: string) => {
                try {
                    const res = api.post("/reset-password", {
                        email: email.trim().toLowerCase(),
                        otp: String(otp).trim(),
                        password,
                    });

                    toast.promise(res, {
                        loading: "Resetting password...",
                        success: (res) =>
                            res.data.message || "Password reset successful",
                        error: (err) =>
                            err.response?.data?.message ||
                            err.message ||
                            "Internal Server Error",
                    });

                    const response = await res;
                    console.log(response);

                    return true;
                } catch (error) {
                    console.log(error);
                    return false;
                }
            },

            logout: async () => {
                try {
                    const res = api.post("/logout");

                    toast.promise(res, {
                        loading: "Logging out...",
                        success: (res) =>
                            res.data.message || "Logout successful",
                        error: (err) =>
                            err.response?.data?.message ||
                            err.message ||
                            "Internal Server Error",
                    });

                    const response = await res;
                    console.log(response);

                    set({
                        currentUser: null,
                        email: null,
                    });

                    return true;
                } catch (error) {
                    console.log(error);
                    return false;
                }
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