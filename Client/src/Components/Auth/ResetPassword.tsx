import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import useStudentStore from "../../store/StudentStore";

function ResetPassword() {
    const navigate = useNavigate();
    const storedEmail = useStudentStore((state) => state.email);
    const forgotPassword = useStudentStore((state) => state.forgotPassword);
    const resetPassword = useStudentStore((state) => state.resetPassword);

    const [step, setStep] = useState<"request" | "verify">("request");
    const [email, setEmail] = useState<string>(storedEmail ? String(storedEmail) : "");
    const [otp, setOtp] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Step 1: Send OTP to user's email
    const handleRequestOtp = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email.trim()) {
            toast.error("Please enter your email address.");
            return;
        }

        setIsSubmitting(true);
        const success = await forgotPassword(email.trim().toLowerCase());
        setIsSubmitting(false);

        if (success) {
            setStep("verify");
        }
    };

    // Step 2: Verify OTP and reset password
    const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (otp.trim().length === 0) {
            toast.error("Please enter the verification code.");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        const success = await resetPassword(email.trim().toLowerCase(), otp.trim(), password);
        setIsSubmitting(false);

        if (success) {
            toast.success("Password reset successfully! Please log in.");
            navigate("/login");
        }
    };

    // Resend OTP helper
    const handleResendOtp = async () => {
        if (!email.trim() || isSubmitting) return;
        setIsSubmitting(true);
        await forgotPassword(email.trim().toLowerCase());
        setIsSubmitting(false);
    };

    return (
        <main className="min-h-screen bg-[#f2f5f1] px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
            <div className="mx-auto grid min-h-[min(760px,calc(100vh-4rem))] max-w-5xl overflow-hidden rounded-xl bg-white shadow-[0_24px_80px_-32px_rgba(15,45,38,0.35)] md:grid-cols-[0.9fr_1.1fr]">
                {/* Left Branding Side */}
                <aside className="relative flex flex-col justify-between overflow-hidden bg-[#173d35] p-8 text-white sm:p-10 md:p-12">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[40px] border-[#94b9a0]/15"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full border-[40px] border-[#e2a46f]/15"
                    />

                    <div className="relative">
                        <div className="mb-12 flex items-center gap-3 md:mb-20">
                            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e2a46f] text-sm font-extrabold text-[#173d35]">
                                CA
                            </span>
                            <span className="text-sm font-bold tracking-wide">
                                Common Assessment
                            </span>
                        </div>
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#b9d2bf]">
                            Account Security
                        </p>
                        <h1 className="max-w-sm text-4xl font-extrabold leading-tight sm:text-5xl">
                            Reset your account password.
                        </h1>
                        <p className="mt-5 max-w-sm text-sm leading-6 text-[#d2e1d6]">
                            Regain access to your collaborative workspace, assessments, and study groups safely.
                        </p>
                    </div>

                    <p className="relative mt-12 text-xs text-[#b9d2bf]">
                        A focused space for students and teams.
                    </p>
                </aside>

                {/* Right Form Side */}
                <section className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-12 md:py-12">
                    <div className="w-full max-w-md">
                        {step === "request" ? (
                            /* Step 1: Request OTP Form */
                            <div className="space-y-6">
                                <div className="mb-8">
                                    <p className="text-sm font-semibold text-[#47735f]">
                                        Password Recovery
                                    </p>
                                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                                        Forgot Password?
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Enter the email address associated with your account and we&apos;ll send you a verification code.
                                    </p>
                                </div>

                                <form className="space-y-5" onSubmit={handleRequestOtp}>
                                    <div>
                                        <label
                                            htmlFor="reset-email"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Email address
                                        </label>
                                        <input
                                            id="reset-email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@university.edu"
                                            required
                                            className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !email.trim()}
                                        className="w-full rounded-md bg-[#315d4a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#244b3b] focus:outline-none focus:ring-2 focus:ring-[#47735f] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
                                    >
                                        {isSubmitting ? "Sending code..." : "Send Verification Code"}
                                    </button>

                                    <div className="flex items-center justify-center pt-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate("/login")}
                                            className="text-sm font-semibold text-[#315d4a] transition hover:underline"
                                        >
                                            ← Back to sign in
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            /* Step 2: Verify OTP & Enter New Password */
                            <div className="space-y-6">
                                <div className="mb-6">
                                    <p className="text-sm font-semibold text-[#47735f]">
                                        Verification & Update
                                    </p>
                                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                                        Set New Password
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Enter the 4-digit verification code sent to your email and choose your new password.
                                    </p>
                                </div>

                                <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4 text-emerald-950">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-[#315d4a]">
                                            <svg
                                                className="h-5 w-5 shrink-0 text-[#47735f]"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span>Check your inbox</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setStep("request")}
                                            className="text-xs font-semibold text-[#315d4a] hover:underline"
                                        >
                                            Change email
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs leading-5 text-slate-600">
                                        Code sent to <strong className="text-slate-900">{email}</strong>
                                    </p>
                                </div>

                                <form className="space-y-4" onSubmit={handleResetPassword}>
                                    <div>
                                        <label
                                            htmlFor="reset-otp"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Verification Code (OTP)
                                        </label>
                                        <input
                                            id="reset-otp"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                            placeholder="••••"
                                            autoComplete="one-time-code"
                                            autoFocus
                                            required
                                            className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-slate-900 outline-none transition placeholder:tracking-normal placeholder:text-slate-300 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="reset-new-password"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            New Password
                                        </label>
                                        <input
                                            id="reset-new-password"
                                            name="password"
                                            type="password"
                                            autoComplete="new-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="At least 6 characters"
                                            required
                                            minLength={6}
                                            className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="reset-confirm-password"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Confirm New Password
                                        </label>
                                        <input
                                            id="reset-confirm-password"
                                            name="confirmPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter your new password"
                                            required
                                            minLength={6}
                                            className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || otp.trim().length === 0 || password.length < 6 || confirmPassword.length < 6}
                                        className="w-full rounded-md bg-[#315d4a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#244b3b] focus:outline-none focus:ring-2 focus:ring-[#47735f] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSubmitting ? "Updating Password..." : "Reset Password"}
                                    </button>

                                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep("request")}
                                            className="font-medium text-[#315d4a] transition hover:underline"
                                        >
                                            ← Back to change email
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={isSubmitting}
                                            className="font-medium text-[#315d4a] transition hover:underline disabled:opacity-50"
                                        >
                                            Didn&apos;t receive code? Resend
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            <Toaster />
        </main>
    );
}

export default ResetPassword;