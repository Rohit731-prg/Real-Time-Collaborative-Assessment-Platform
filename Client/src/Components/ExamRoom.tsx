import { useCallback, useEffect, useRef, useState } from "react";
import {
  LuArrowLeft,
  LuBookmark,
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuClock3,
  LuShieldCheck,
} from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import useExamStore from "../store/ExamStore";
import useQuestionStore from "../store/QuestionStore";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function ExamRoom() {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const exam = useExamStore((state) => state.exam);
  const questionId = useExamStore((state) => state.questionId);
  const loadActiveExam = useExamStore((state) => state.loadActiveExam);
  const submitExam = useExamStore((state) => state.submitExam);
  const questions = useQuestionStore((state) => state.questions);
  const [isLoadingExam, setIsLoadingExam] = useState(!exam?._id || !questionId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const submissionStarted = useRef(false);
  const autoSubmitStarted = useRef(false);

  useEffect(() => {
    if (!exam?._id) {
      setRemainingSeconds(null);
      return;
    }

    setRemainingSeconds(exam.durationMinutes * 60);
  }, [exam?._id, exam?.durationMinutes]);

  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0 || isSubmitted) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) =>
        seconds === null ? null : Math.max(0, seconds - 1)
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isSubmitted, remainingSeconds]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.values(answers).filter((answer) => answer.trim()).length;
  const goToRoom = useCallback(
    () => navigate(roomCode ? `/roomChat/${roomCode}` : "/home"),
    [navigate, roomCode]
  );

  useEffect(() => {
    if (exam?._id && questionId) {
      setIsLoadingExam(false);
      return;
    }

    if (!roomCode) {
      setIsLoadingExam(false);
      return;
    }

    let cancelled = false;
    setIsLoadingExam(true);
    void loadActiveExam(roomCode).finally(() => {
      if (!cancelled) setIsLoadingExam(false);
    });

    return () => {
      cancelled = true;
    };
  }, [exam?._id, loadActiveExam, questionId, roomCode]);

  const handleSubmit = useCallback(async () => {
    if (submissionStarted.current || isSubmitted) return;

    if (!exam?._id || !questionId) {
      toast.error("This exam is missing its submission details. Please reopen it.");
      return;
    }

    submissionStarted.current = true;
    setIsSubmitting(true);
    const submitted = await submitExam({
      examId: exam._id,
      questionId,
      roomCode: String(roomCode),
      answer: questions.map((_, index) => answers[index] ?? ""),
    });
    setIsSubmitting(false);

    if (submitted) {
      setIsSubmitted(true);
      goToRoom();
    } else {
      submissionStarted.current = false;
    }
  }, [answers, exam, goToRoom, isSubmitted, questionId, questions, roomCode, submitExam]);

  useEffect(() => {
    if (
      remainingSeconds !== 0 ||
      !exam?._id ||
      !questionId ||
      isSubmitted ||
      autoSubmitStarted.current
    ) return;

    autoSubmitStarted.current = true;
    void handleSubmit();
  }, [exam?._id, handleSubmit, isSubmitted, questionId, remainingSeconds]);

  if (isLoadingExam) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f3f5f2] px-5 text-center text-slate-900">
        <p className="text-sm text-slate-600">Loading exam...</p>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f3f5f2] px-5 text-center text-slate-900">
        <div>
          <h1 className="text-xl font-semibold">Exam questions are not available</h1>
          <p className="mt-2 text-sm text-slate-600">
            Return to the room and start the exam again.
          </p>
          <button
            type="button"
            onClick={goToRoom}
            className="mt-5 rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Back to room
          </button>
        </div>
      </main>
    );
  }

  const questionStates = questions.map((_, index) => ({
    number: index + 1,
    state:
      index === currentIndex
        ? "current"
        : answers[index]?.trim()
          ? "answered"
          : "upcoming",
  }));

  return (
    <main className="min-h-dvh bg-[#f3f5f2] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-emerald-900 text-sm font-bold text-white">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-wide text-slate-900">ASSESS</p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Collaborative learning room
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />
            {isSubmitted ? "Submitted" : "In progress"}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 pb-10 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:pt-10">
        <section className="min-w-0">
          <button
            type="button"
            onClick={goToRoom}
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-900"
          >
            <LuArrowLeft aria-hidden="true" size={17} />
            Back to room
          </button>

          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
                Assessment
              </p>
              <h1 className="max-w-3xl text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
                {exam?.title ?? "Assessment"}
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              {questions.length} questions · {exam?.totalMarks ?? 0} points
            </p>
          </div>

          <section
            aria-labelledby="question-title"
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.3)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-emerald-900">
                  {String(currentIndex + 1).padStart(2, "0")}
                </span>
                <span className="h-4 w-px bg-slate-200" />
                <span className="text-sm font-medium text-slate-600">Question</span>
              </div>
              <span className="rounded-sm bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {currentQuestion.marks} points
              </span>
            </div>

            <div className="px-5 py-6 sm:px-8 sm:py-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {currentQuestion.topic}
              </p>
              <h2
                id="question-title"
                className="max-w-3xl text-lg font-medium leading-8 text-slate-900 sm:text-xl"
              >
                {currentQuestion.question}
              </h2>

              <div className="mt-8">
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <label htmlFor="answer" className="text-sm font-semibold text-slate-800">
                    Your response
                  </label>
                  <span className="text-xs text-slate-500">Long answer</span>
                </div>
                <textarea
                  id="answer"
                  rows={10}
                  value={answers[currentIndex] ?? ""}
                  disabled={isSubmitted}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setAnswers((current) => ({
                      ...current,
                      [currentIndex]: value,
                    }));
                  }}
                  placeholder="Write your answer here..."
                  className="block min-h-56 w-full resize-y rounded-md border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-8">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <LuBookmark aria-hidden="true" size={16} />
                Review later
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((index) => index - 1)}
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-600 disabled:text-slate-400"
                >
                  <LuChevronLeft aria-hidden="true" size={17} />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex((index) => index + 1)}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-950 disabled:cursor-not-allowed disabled:bg-slate-300"
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
              <h2 id="time-title" className="text-sm font-medium">Time remaining</h2>
            </div>
            <p className="mt-3 font-mono text-4xl font-semibold tracking-wide text-slate-950">
              {formatTime(remainingSeconds ?? (exam?.durationMinutes ?? 0) * 60)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Minutes : seconds</p>
          </section>

          <section aria-labelledby="progress-title" className="border-b border-slate-200 py-6">
            <div className="flex items-center justify-between gap-3">
              <h2 id="progress-title" className="text-sm font-semibold text-slate-800">Your progress</h2>
              <span className="text-xs font-medium text-slate-500">
                {answeredCount} of {questions.length} answered
              </span>
            </div>
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-label="Assessment progress"
              aria-valuemin={0}
              aria-valuemax={questions.length}
              aria-valuenow={answeredCount}
            >
              <div
                className="h-full rounded-full bg-emerald-800"
                style={{
                  width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%`,
                }}
              />
            </div>
          </section>

          <section aria-labelledby="navigator-title" className="py-6">
            <div className="flex items-center justify-between gap-3">
              <h2 id="navigator-title" className="text-sm font-semibold text-slate-800">Questions</h2>
              <span className="text-xs text-slate-500">{questions.length} total</span>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2.5">
              {questionStates.map(({ number, state }) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setCurrentIndex(number - 1)}
                  aria-label={`Question ${number}${state === "current" ? ", current question" : state === "answered" ? ", answered" : ", not answered"}`}
                  aria-current={state === "current" ? "step" : undefined}
                  className={`relative grid aspect-square place-items-center rounded-md border text-sm font-semibold ${state === "current" ? "border-emerald-900 bg-emerald-900 text-white ring-2 ring-emerald-900/15 ring-offset-2" : state === "answered" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}
                >
                  {state === "answered" ? (
                    <LuCheck aria-hidden="true" size={16} />
                  ) : (
                    String(number).padStart(2, "0")
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="border-t border-slate-200 pt-5">
            <p className="text-sm font-semibold text-slate-800">Ready to submit?</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Review your responses before ending the assessment.
            </p>
            <button
              type="button"
              disabled={isSubmitting || isSubmitted}
              onClick={() => void handleSubmit()}
              className="mt-4 w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting
                ? "Submitting..."
                : isSubmitted
                  ? "Assessment submitted"
                  : "Submit assessment"}
            </button>
          </section>
        </aside>
      </div>
      <Toaster />
    </main>
  );
}

export default ExamRoom;
