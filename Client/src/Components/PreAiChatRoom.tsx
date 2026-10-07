import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LuBot, LuClock, LuAward, LuBookOpen } from "react-icons/lu";
import { GrSend } from "react-icons/gr";
import { toast, Toaster } from "react-hot-toast";

import useAiChatStore from "../store/AiChatStore";
import useExamStore from "../store/ExamStore";

type ExamItem = {
    _id: string;
    courseId: string;
    roomId: string;
    title: string;
    durationMinutes: number;
    totalMarks: number;
    questionId?: string;
    answer?: string;
};

function PreAiChatRoom() {
    const { roomCode } = useParams<{ roomCode?: string }>();
    const navigate = useNavigate();

    const { getAllExams, exams } = useExamStore();

    const { messages, getAllMessage, sendMessage } = useAiChatStore();

    const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
    const [query, setQuery] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Get all exams of this room
    useEffect(() => {
        const loadExams = async () => {
            if (!roomCode) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                await getAllExams(roomCode);
            } finally {
                setIsLoading(false);
            }
        };

        loadExams();
    }, [getAllExams, roomCode]);

    // Load chat whenever an exam is selected
    useEffect(() => {
        if (!selectedExam) return;

        const loadChat = async () => {
            try {
                await getAllMessage(selectedExam._id);
            } catch (error) {
                console.error("Failed to load chat:", {error});
            }
        };

        loadChat();
    }, [getAllMessage, selectedExam]);

    // Scroll chat to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    // Send message
    const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const message = query.trim();

        if (!message || !selectedExam || isSending) {
            return;
        }

        setIsSending(true);

        try {
            await sendMessage(
                {
                    questionId: selectedExam.questionId || selectedExam._id,
                    examId: selectedExam._id,
                    courseId: selectedExam.courseId,
                    roomId: selectedExam.roomId,
                    answer: selectedExam.answer ?? "",
                },
                message
            );

            setQuery("");
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to get AI response. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <main className="flex h-screen flex-col bg-slate-100 text-slate-900">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/home")}
                        className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        ← Back to Home
                    </button>

                    <div>
                        <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                            Assessment & AI Study Room
                        </h1>

                        {roomCode && (
                            <p className="font-mono text-xs text-slate-500">
                                Room:{" "}
                                <span className="font-semibold text-emerald-800">
                                    {roomCode}
                                </span>
                            </p>
                        )}
                    </div>
                </div>

                {roomCode && (
                    <button
                        type="button"
                        onClick={() => navigate(`/examRoom/${roomCode}`)}
                        className="rounded-md bg-emerald-800 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-900"
                    >
                        Take Active Exam
                    </button>
                )}
            </header>

            {/* Main */}
            <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-12">
                {/* Exams */}
                <section className="flex flex-col border-r border-slate-200 bg-white md:col-span-5 lg:col-span-4">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <div className="flex items-center gap-2">
                            <LuBookOpen
                                className="text-emerald-800"
                                size={19}
                            />

                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                                Room Assessments
                            </h2>
                        </div>

                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                            {exams.length}{" "}
                            {exams.length === 1 ? "exam" : "exams"}
                        </span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {isLoading ? (
                            <p className="py-12 text-center text-sm text-slate-500">
                                Loading exams...
                            </p>
                        ) : exams.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                                <LuBookOpen
                                    className="mx-auto text-slate-400"
                                    size={32}
                                />

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                    No exams found
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    There are currently no exams assigned to
                                    this room.
                                </p>
                            </div>
                        ) : (
                            exams.map((exam: ExamItem) => {
                                const isSelected =
                                    selectedExam?._id === exam._id;

                                return (
                                    <div
                                        key={exam._id}
                                        onClick={() => setSelectedExam(exam)}
                                        className={`cursor-pointer rounded-xl border p-4 transition ${isSelected
                                            ? "border-emerald-600 bg-emerald-50/70 shadow-sm"
                                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <h3
                                                className={`text-sm font-bold ${isSelected
                                                    ? "text-emerald-950"
                                                    : "text-slate-900"
                                                    }`}
                                            >
                                                {exam.title}
                                            </h3>

                                            {isSelected && (
                                                <span className="shrink-0 rounded bg-emerald-800 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                                                    Active
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                                            <span className="flex items-center gap-1">
                                                <LuClock
                                                    size={14}
                                                    className="text-slate-400"
                                                />
                                                {exam.durationMinutes} mins
                                            </span>

                                            <span className="flex items-center gap-1">
                                                <LuAward
                                                    size={14}
                                                    className="text-slate-400"
                                                />
                                                {exam.totalMarks} marks
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                                            <span className="text-[11px] text-slate-400">
                                                Click to chat with AI
                                            </span>

                                            {roomCode && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(
                                                            `/examRoom/${roomCode}`
                                                        );
                                                    }}
                                                    className="font-semibold text-emerald-800 hover:underline"
                                                >
                                                    Start Exam →
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* AI Chat */}
                <section className="flex min-h-0 flex-col bg-slate-50 md:col-span-7 lg:col-span-8">
                    {selectedExam ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                                        <LuBot size={20} />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900">
                                            AI Tutor: {selectedExam.title}
                                        </h2>

                                        <p className="text-xs text-slate-500">
                                            Ask questions, clarify assessment
                                            topics, and practice concepts.
                                        </p>
                                    </div>
                                </div>

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                    AI Active
                                </span>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                                {messages === null ? (
                                    <div className="flex h-full items-center justify-center">
                                        <p className="text-xs text-slate-500">
                                            Loading conversation...
                                        </p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="mx-auto my-auto max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-800">
                                            <LuBot size={24} />
                                        </div>

                                        <h3 className="mt-3 text-sm font-bold text-slate-900">
                                            Start your assessment chat
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Have questions about "
                                            {selectedExam.title}"? Type below
                                            to begin your tutoring session.
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((message) => {
                                        const isUser =
                                            message.role === "user";

                                        return (
                                            <div
                                                key={message._id}
                                                className={`flex items-start gap-3 ${isUser
                                                    ? "justify-end"
                                                    : "justify-start"
                                                    }`}
                                            >
                                                {!isUser && (
                                                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                                                        <LuBot size={17} />
                                                    </div>
                                                )}

                                                <div
                                                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[75%] ${isUser
                                                        ? "rounded-tr-none bg-emerald-800 text-white"
                                                        : "rounded-tl-none border border-slate-200 bg-white text-slate-900 whitespace-pre-wrap"
                                                        }`}
                                                >
                                                    {message.content}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <footer className="border-t border-slate-200 bg-white p-3 sm:p-4">
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                        placeholder={`Ask about ${selectedExam.title}...`}
                                        disabled={isSending}
                                        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 disabled:opacity-60"
                                    />

                                    <button
                                        type="submit"
                                        disabled={
                                            isSending || !query.trim()
                                        }
                                        className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-800 text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label="Send message"
                                    >
                                        <GrSend size={15} />
                                    </button>
                                </form>
                            </footer>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-800">
                                <LuBot size={32} />
                            </div>

                            <h2 className="mt-4 text-base font-bold text-slate-800">
                                Select an assessment
                            </h2>

                            <p className="mt-1 max-w-sm text-xs text-slate-500">
                                Choose an exam from the left sidebar to view
                                its details and start or continue chatting
                                with your AI tutor.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            <Toaster />
        </main>
    );
}

export default PreAiChatRoom;