import { useEffect, useRef, useState, type FormEvent } from "react";
import { GrSend } from "react-icons/gr";
import { LuBot, LuSparkles } from "react-icons/lu";
import useAnswerStore from "../store/AnswerStore";
import useAiChatStore, { type AiChatContext } from "../store/AiChatStore";
import useExamStore from "../store/ExamStore";

function Overview() {
    const result = useAnswerStore((state) => state.submissionResult);
    const exam = useExamStore((state) => state.exam);
    const questionId = useExamStore((state) => state.questionId);
    const messages = useAiChatStore((state) => state.messages);
    const getAllMessage = useAiChatStore((state) => state.getAllMessage);
    const sendMessage = useAiChatStore((state) => state.sendMessage);

    const [query, setQuery] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState("");
    const messagesEnd = useRef<HTMLDivElement | null>(null);

    const context: AiChatContext | null = result && exam && questionId
        ? {
            questionId,
            examId: exam._id,
            courseId: exam.courseId,
            roomId: exam.roomId,
            answer: result.overview || "The student has completed this assessment.",
        }
        : null;

    useEffect(() => {
        if (!result || !exam || !questionId) return;

        let cancelled = false;
        void getAllMessage(exam._id)
            .then(() => {
                if (!cancelled) setError("");
            })
            .catch((requestError: unknown) => {
                if (!cancelled) {
                    setError(requestError instanceof Error ? requestError.message : "Could not load chat history.");
                }
            });

        return () => {
            cancelled = true;
        };
    }, [exam, getAllMessage, questionId, result]);

    useEffect(() => {
        messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages?.length]);

    if (!result) return null;

    const score = result.results.reduce((total, item) => total + item.marks, 0);
    const percentage = result.totalMarks > 0
        ? Math.min(100, Math.round((score / result.totalMarks) * 100))
        : 0;
    const overview = new DOMParser()
        .parseFromString(result.overview, "text/html")
        .body.textContent?.trim() || "Ask me anything about your assessment.";

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedQuery = query.trim();
        if (!trimmedQuery || !context || isSending) return;

        setError("");
        setIsSending(true);
        try {
            await sendMessage(context, trimmedQuery);
            setQuery("");
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Could not send your question.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <section
            aria-labelledby="assessment-chat-title"
            className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-900">
                        <LuBot aria-hidden="true" size={21} />
                    </span>
                    <div>
                        <h2 id="assessment-chat-title" className="font-semibold text-slate-900">Ask your AI tutor</h2>
                        <p className="text-sm text-slate-500">{result.examTitle}</p>
                    </div>
                </div>
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-950">
                    Score: {score}/{result.totalMarks} ({percentage}%)
                </p>
            </header>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
                <article className="flex items-start gap-3">
                    <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-900">
                        <LuSparkles aria-hidden="true" size={16} />
                    </span>
                    <div className="max-w-[85%] rounded-xl bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-800">
                        <p className="mb-1 font-semibold">Assessment feedback</p>
                        <p className="whitespace-pre-wrap">{overview}</p>
                    </div>
                </article>

                {messages?.map((message) => (
                    <article
                        key={message._id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <p className={`max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-4 py-3 text-sm leading-6 ${
                            message.role === "user"
                                ? "bg-emerald-800 text-white"
                                : "bg-slate-100 text-slate-800"
                        }`}>
                            {message.content}
                        </p>
                    </article>
                ))}

                {messages === null && <p className="text-sm text-slate-500" role="status">Loading chat history...</p>}
                {isSending && (
                    <p className="text-sm text-slate-500" role="status">Your tutor is thinking...</p>
                )}
                {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
                <div ref={messagesEnd} />
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-3 border-t border-slate-200 p-4">
                <label className="sr-only" htmlFor="assessment-question">Ask a question</label>
                <textarea
                    id="assessment-question"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            event.currentTarget.form?.requestSubmit();
                        }
                    }}
                    placeholder="Ask a question about your assessment..."
                    rows={1}
                    disabled={!context || messages === null || isSending}
                    className="min-w-0 flex-1 resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 disabled:bg-slate-100"
                />
                <button
                    type="submit"
                    aria-label="Send question"
                    disabled={!context || messages === null || !query.trim() || isSending}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    <GrSend aria-hidden="true" />
                </button>
            </form>

            <details className="border-t border-slate-200 px-5 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">Review your answers</summary>
                <div className="mt-3 space-y-3">
                    {result.results.map((item, index) => (
                        <article key={`${index}-${item.question}`} className="rounded-lg bg-slate-50 p-3 text-sm">
                            <p className="font-semibold text-slate-900">{index + 1}. {item.question} <span className="font-normal text-slate-500">({item.marks} pts)</span></p>
                            <p className="mt-2 text-slate-600"><span className="font-medium">Your answer:</span> {item.studentAnswer || "No answer submitted"}</p>
                            <p className="mt-1 text-slate-600"><span className="font-medium">Expected:</span> {item.correctAnswer}</p>
                            {item.comment && <p className="mt-1 text-slate-600">{item.comment}</p>}
                        </article>
                    ))}
                </div>
            </details>
        </section>
    );
}

export default Overview;
