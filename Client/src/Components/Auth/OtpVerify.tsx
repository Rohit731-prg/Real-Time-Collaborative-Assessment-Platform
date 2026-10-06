import { useState, type FormEvent } from "react";
import useStudentStore from "../../store/StudentStore";

type OtpVerifyProps = {
    setShowOtp: (show: boolean) => void;
};

function OtpVerify({ setShowOtp }: OtpVerifyProps) {
    const { verifyOtp, email } = useStudentStore();

    const [otp, setOtp] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const res = await verifyOtp(otp.trim());
        setIsSubmitting(false);

        if (res) {
            setOtp("");
            setShowOtp(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4 text-emerald-950">
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
                    <span>Check your email</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                    We sent a verification code to{" "}
                    <strong className="text-slate-900">{email || "your email address"}</strong>.
                    Enter the code below to activate your account.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label
                        htmlFor="otp-input"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Verification code
                    </label>

                    <input
                        id="otp-input"
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

                <button
                    type="submit"
                    disabled={isSubmitting || otp.trim().length === 0}
                    className="w-full rounded-md bg-[#315d4a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#244b3b] focus:outline-none focus:ring-2 focus:ring-[#47735f] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? "Verifying..." : "Verify & Complete Signup"}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500">
                    <button
                        type="button"
                        onClick={() => setShowOtp(false)}
                        className="font-medium text-[#315d4a] transition hover:underline"
                    >
                        ← Back to signup
                    </button>
                    <span>Didn't receive code? Check spam</span>
                </div>
            </form>
        </div>
    );
}

export default OtpVerify;