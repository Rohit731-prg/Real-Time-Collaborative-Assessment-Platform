import { useState } from "react";
import useStudentStore from "../../store/StudentStore";
import Login from "./Login"
import Signup from "./Signup"
import { Toaster } from "react-hot-toast";

function MainAuth() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const currentUser = useStudentStore((state) => state.currentUser);
  const logout = useStudentStore((state) => state.logout);

  return (
    <main className="min-h-screen bg-[#f2f5f1] px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
      <div className="mx-auto grid min-h-[min(760px,calc(100vh-4rem))] max-w-5xl overflow-hidden rounded-xl bg-white shadow-[0_24px_80px_-32px_rgba(15,45,38,0.35)] md:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative flex flex-col justify-between overflow-hidden bg-[#173d35] p-8 text-white sm:p-10 md:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[40px] border-[#94b9a0]/15" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full border-[40px] border-[#e2a46f]/15" />
          <div className="relative">
            <div className="mb-12 flex items-center gap-3 md:mb-20">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e2a46f] text-sm font-extrabold text-[#173d35]">CA</span>
              <span className="text-sm font-bold tracking-wide">Common Assessment</span>
            </div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#b9d2bf]">Learn together</p>
            <h1 className="max-w-sm text-4xl font-extrabold leading-tight sm:text-5xl">Better work starts with a shared space.</h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[#d2e1d6]">Join your classmates to prepare, collaborate, and take on assessments with confidence.</p>
          </div>
          <p className="relative mt-12 text-xs text-[#b9d2bf]">A focused space for students and teams.</p>
        </aside>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-12 md:py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-semibold text-[#47735f]">Welcome to your workspace</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {activeTab === "login" ? "Sign in" : "Create your account"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {activeTab === "login" ? "Pick up where your team left off." : "Set up your student profile to get started."}
              </p>
              {currentUser && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-[#d5e3d8] bg-[#f4f8f4] px-3 py-2 text-sm">
                  <span className="min-w-0 truncate text-slate-700">Signed in as <strong>{currentUser.email}</strong></span>
                  <button type="button" onClick={logout} className="shrink-0 font-semibold text-[#315d4a] hover:underline">Sign out</button>
                </div>
              )}
            </div>

            <div className="mb-8 grid grid-cols-2 border-b border-slate-200" role="tablist" aria-label="Account access">
              <button
                id="login-tab"
                type="button"
                role="tab"
                aria-selected={activeTab === "login"}
                aria-controls="auth-panel"
                onClick={() => setActiveTab("login")}
                className={`-mb-px border-b-2 px-3 py-3 text-sm font-bold transition-colors ${activeTab === "login" ? "border-[#47735f] text-[#315d4a]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                Log in
              </button>
              <button
                id="signup-tab"
                type="button"
                role="tab"
                aria-selected={activeTab === "signup"}
                aria-controls="auth-panel"
                onClick={() => setActiveTab("signup")}
                className={`-mb-px border-b-2 px-3 py-3 text-sm font-bold transition-colors ${activeTab === "signup" ? "border-[#47735f] text-[#315d4a]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                Sign up
              </button>
            </div>

            <div id="auth-panel" role="tabpanel" aria-labelledby={activeTab === "login" ? "login-tab" : "signup-tab"}>
              {activeTab === "login" ? <Login /> : <Signup />}
            </div>
          </div>
        </section>
      </div>
      <Toaster />
    </main>
  )
}

export default MainAuth