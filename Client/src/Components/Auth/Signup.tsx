import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import useStudentStore from "../../store/StudentStore";
import OtpVerify from "./OtpVerify";

function Signup() {
    const { signUp } = useStudentStore();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOtp, setShowOtp] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);

        const password = String(formData.get("password"));
        const confirmPassword = String(formData.get("confirmPassword"));

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            setIsSubmitting(false);
            return;
        }

        const userDetails = {
            name: String(formData.get("name")),
            email: String(formData.get("email"))
                .trim()
                .toLowerCase(),
            password,
            university: String(formData.get("university")),
            department: String(formData.get("department")),
            semester: Number(formData.get("semester")),
        };

        const success = await signUp(userDetails);

        setIsSubmitting(false);

        if (success) {
            console.log(success);
            setShowOtp(true);
        }
    };

    if (showOtp) {
        return <OtpVerify setShowOtp={setShowOtp} />;
    }

    return (
        <form
            className="space-y-4"
            onSubmit={handleSubmit}
        >
            <div>
                <label
                    htmlFor="signup-name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
                    Full name
                </label>

                <input
                    id="signup-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    required
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                />
            </div>

            <div>
                <label
                    htmlFor="signup-email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
                    Email address
                </label>

                <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@university.edu"
                    required
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="signup-university"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        University or school
                    </label>

                    <input
                        id="signup-university"
                        name="university"
                        type="text"
                        autoComplete="organization"
                        placeholder="School name"
                        required
                        className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                    />
                </div>

                <div>
                    <label
                        htmlFor="signup-department"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Department
                    </label>

                    <input
                        id="signup-department"
                        name="department"
                        type="text"
                        placeholder="e.g. Computer Science"
                        required
                        className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="signup-semester"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Semester
                    </label>

                    <input
                        id="signup-semester"
                        name="semester"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Current semester"
                        required
                        className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                    />
                </div>

                <div>
                    <label
                        htmlFor="signup-password"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Password
                    </label>

                    <input
                        id="signup-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        minLength={6}
                        placeholder="At least 6 characters"
                        required
                        className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor="signup-confirm-password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
                    Confirm password
                </label>

                <input
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    placeholder="Enter your password again"
                    required
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-[#315d4a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#244b3b] focus:outline-none focus:ring-2 focus:ring-[#47735f] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            >
                {isSubmitting
                    ? "Creating account..."
                    : "Create student account"}
            </button>

            <p className="text-xs leading-5 text-slate-500">
                By creating an account, you agree to use this workspace
                respectfully with your learning community.
            </p>
        </form>
    );
}

export default Signup;