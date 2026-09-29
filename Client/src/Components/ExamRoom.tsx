
import {
  LuArrowLeft,
  LuBookmark,
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuClock3,
  LuShieldCheck,
} from "react-icons/lu";

const questionStates = [
  { number: 1, state: "answered" },
  { number: 2, state: "answered" },
  { number: 3, state: "answered" },
  { number: 4, state: "current" },
  { number: 5, state: "upcoming" },
  { number: 6, state: "upcoming" },
  { number: 7, state: "upcoming" },
  { number: 8, state: "upcoming" },
  { number: 9, state: "upcoming" },
  { number: 10, state: "upcoming" },
];

function ExamRoom() {
  return (
    <main className="min-h-dvh bg-[#f3f5f2] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-emerald-900 text-sm font-bold text-white">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-wide text-slate-900">
                ASSESS
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Collaborative learning room
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />
            In progress
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 pb-10 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:pt-10">
        <section className="min-w-0">
          <button
            type="button"
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-900"
          >
            <LuArrowLeft aria-hidden="true" size={17} />
            Back to room
          </button>

          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
                Module 02 · Assessment
              </p>
              <h1 className="max-w-3xl text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
                Foundations of collaborative learning
              </h1>
            </div>
            <p className="text-sm text-slate-500">10 questions · 50 points</p>
          </div>

          <section
            aria-labelledby="question-title"
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.3)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-emerald-900">
                  04
                </span>
                <span className="h-4 w-px bg-slate-200" />
                <span className="text-sm font-medium text-slate-600">
                  Short answer
                </span>
              </div>
              <span className="rounded-sm bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                5 points
              </span>
            </div>

            <div className="px-5 py-6 sm:px-8 sm:py-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Social constructivism
              </p>
              <h2
                id="question-title"
                className="max-w-3xl text-lg font-medium leading-8 text-slate-900 sm:text-xl"
              >
                Explain how peer interaction can support learning in a
                collaborative classroom. Include one example of how learners
                can build on one another’s ideas.
              </h2>

              <div className="mt-8">
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <label
                    htmlFor="answer"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Your response
                  </label>
                  <span className="text-xs text-slate-500">
                    Long answer
                  </span>
                </div>
                <textarea
                  id="answer"
                  rows={10}
                  placeholder="Write your answer here..."
                  className="block min-h-56 w-full resize-y rounded-md border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Use a clear explanation and support it with relevant detail.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-8">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <LuBookmark aria-hidden="true" size={16} />
                Review later
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-400"
                >
                  <LuChevronLeft aria-hidden="true" size={17} />
                  Previous
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
                >
                  Next question
                  <LuChevronRight aria-hidden="true" size={17} />
                </button>
              </div>
            </div>
          </section>

          <p className="mt-4 flex items-center gap-2 px-1 text-xs text-slate-500">
            <LuShieldCheck aria-hidden="true" size={15} />
            Your assessment session is private.
          </p>
        </section>

        <aside className="min-w-0 lg:pt-[3.25rem]">
          <section aria-labelledby="time-title" className="border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 text-slate-500">
              <LuClock3 aria-hidden="true" size={17} />
              <h2 id="time-title" className="text-sm font-medium">
                Time remaining
              </h2>
            </div>
            <p className="mt-3 font-mono text-4xl font-semibold tracking-wide text-slate-950">
              42:18
            </p>
            <p className="mt-1 text-xs text-slate-500">Minutes : seconds</p>
          </section>

          <section aria-labelledby="progress-title" className="border-b border-slate-200 py-6">
            <div className="flex items-center justify-between gap-3">
              <h2 id="progress-title" className="text-sm font-semibold text-slate-800">
                Your progress
              </h2>
              <span className="text-xs font-medium text-slate-500">3 of 10 answered</span>
            </div>
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-label="Assessment progress"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={3}
            >
              <div className="h-full w-[30%] rounded-full bg-emerald-800" />
            </div>
          </section>

          <section aria-labelledby="navigator-title" className="py-6">
            <div className="flex items-center justify-between gap-3">
              <h2 id="navigator-title" className="text-sm font-semibold text-slate-800">
                Questions
              </h2>
              <span className="text-xs text-slate-500">10 total</span>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2.5">
              {questionStates.map(({ number, state }) => (
                <button
                  key={number}
                  type="button"
                  aria-label={`Question ${number}${state === "current" ? ", current question" : state === "answered" ? ", answered" : ", not answered"}`}
                  aria-current={state === "current" ? "step" : undefined}
                  className={`relative grid aspect-square place-items-center rounded-md border text-sm font-semibold ${
                    state === "current"
                      ? "border-emerald-900 bg-emerald-900 text-white ring-2 ring-emerald-900/15 ring-offset-2"
                      : state === "answered"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {state === "answered" ? (
                    <LuCheck aria-hidden="true" size={16} />
                  ) : (
                    String(number).padStart(2, "0")
                  )}
                </button>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-800" />
                Answered
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full border border-slate-400 bg-white" />
                Unanswered
              </span>
            </div>
          </section>

          <section className="border-t border-slate-200 pt-5">
            <p className="text-sm font-semibold text-slate-800">Ready to submit?</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Review your responses before ending the assessment.
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              Submit assessment
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}

export default ExamRoom;