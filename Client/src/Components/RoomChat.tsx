import { useEffect, useRef, useState, type FormEvent } from "react";
import { GrSend } from "react-icons/gr";

import { useNavigate, useParams } from "react-router-dom";
import useExamStore, { type Exam } from "../store/ExamStore";
import type { GeneratedQuestion } from "../store/QuestionStore";
import useMessageStore from "../store/MessageStore";
import useStudentStore from "../store/StudentStore";
import useAnswerStore from "../store/AnswerStore";
import { socket } from "../Utils/socket";
import { roomApi } from "../Utils/Axios";
import toast, { Toaster } from "react-hot-toast";
import Overview from "./Overview";
import useCourseStore from "../store/CourseStore";

type LiveMessage = {
    _id: string;
    message: string;
    userId: { _id: string; name: string };
    createdAt: string;
};

type ExamStartedEvent = {
    roomCode: string;
    examId: string;
    exam: Exam;
    question: { _id: string; questionText: GeneratedQuestion[] | string };
    questions: GeneratedQuestion[] | string;
};

type OnlineStudent = {
    _id: string;
    name: string;
};

function RoomChat() {
    const navigate = useNavigate();
    const { roomCode } = useParams();
    const createExam = useExamStore((state) => state.createExam);
    const loadExam = useExamStore((state) => state.loadExam);
    const { messages, getMessage } = useMessageStore();
    const { courses, getAllCourse } = useCourseStore();
    const currentUser = useStudentStore((state) => state.currentUser);
    const submissionResult = useAnswerStore((state) => state.submissionResult);

    const [roomName, setRoomName] = useState("");
    const [onlineStudents, setOnlineStudents] = useState<OnlineStudent[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
    const [isRoomJoined, setIsRoomJoined] = useState(false);
    const [socketError, setSocketError] = useState("");
    const [typingUser, setTypingUser] = useState("");
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [examPdf, setExamPdf] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState("");
    const [isCreatingExam, setIsCreatingExam] = useState(false);
    const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const messagesEnd = useRef<HTMLDivElement | null>(null);

    const allMessages = [...messages, ...liveMessages];
    const hasResult = Boolean(
        submissionResult &&
        submissionResult.roomCode.toUpperCase() === roomCode?.toUpperCase()
    );

    useEffect(() => {
        async function fetchCourses() {
            await getAllCourse();
        };

        fetchCourses();
    }, []);

    useEffect(() => {
        if (!roomCode) {
            setRoomName("");
            return;
        }

        let cancelled = false;
        void roomApi.get<{ room: { name: string } }>(`/${encodeURIComponent(roomCode)}`)
            .then(({ data }) => {
                if (!cancelled) setRoomName(data.room.name);
            })
            .catch((error: unknown) => {
                console.error("Failed to load room details:", error);
                if (!cancelled) setRoomName("");
            });

        return () => {
            cancelled = true;
        };
    }, [roomCode]);

    useEffect(() => {
        if (roomCode) void getMessage(roomCode);
    }, [getMessage, roomCode]);

    useEffect(() => {
        messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
    }, [allMessages.length]);

    useEffect(() => {
        const handleConnect = () => {
            console.log("SOCKET CONNECTED:", socket.id);
            setSocketError("");
            setOnlineStudents([]);

            socket.emit("join-room", {
                roomCode: roomCode
            });
        };

        const handleConnectError = (error: Error) => {
            console.log("SOCKET ERROR:", error.message);
            setSocketError(error.message);
            setIsRoomJoined(false);
        };

        const handleRoomJoined = () => {
            setIsRoomJoined(true);
            setSocketError("");
        };

        const handleOnlineStudents = (students: OnlineStudent[]) => {
            setOnlineStudents(students);
        };

        const handleServerError = (error: string) => {
            setSocketError(error);
            setIsRoomJoined(false);
        };

        const handleReceivedMessage = (data: { message: string; sender: { _id: string; name: string } }) => {
            console.log("MESSAGE RECEIVED:", data);
            setLiveMessages((current) => [...current, {
                _id: crypto.randomUUID(),
                message: data.message,
                userId: data.sender,
                createdAt: new Date().toISOString(),
            }]);
        };

        const handleTyping = (data: { _id: string; name: string }) => {
            console.log("Typing: ", data);
            if (data._id === currentUser?._id) return;

            setTypingUser(data.name);
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(() => setTypingUser(""), 1800);
        };

        const handleExamStart = (data: ExamStartedEvent) => {
            if (!data?.examId || !data.roomCode || !data.exam || !data.question?._id) {
                toast.error("Exam details are missing. Please restart the exam.");
                return;
            }

            useAnswerStore.getState().setSubmissionResult(null);
            loadExam(data.exam, data.question._id, data.questions ?? data.question.questionText);
            navigate(`/examRoom/${data.roomCode}`);
        };

        socket.on("connect", handleConnect);
        socket.on("connect_error", handleConnectError);
        socket.on("room-joined", handleRoomJoined);
        socket.on("error", handleServerError);
        socket.on("online-students", handleOnlineStudents);
        socket.on("received-message", handleReceivedMessage);
        socket.on("user-typing", handleTyping);
        socket.on("exam-started", handleExamStart);

        if (!socket.connected) {
            socket.connect();
        } else {
            handleConnect();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("connect_error", handleConnectError);
            socket.off("room-joined", handleRoomJoined);
            socket.off("error", handleServerError);
            socket.off("online-students", handleOnlineStudents);
            socket.off("received-message", handleReceivedMessage);
            socket.off("user-typing", handleTyping);
            socket.off("exam-started", handleExamStart);
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
        };
    }, [currentUser?._id, loadExam, navigate, roomCode]);

    const sendMessage = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!newMessage.trim()) {
            return;
        }

        console.log("SENDING:", newMessage);

        socket.emit("send-message", {
            message: newMessage,
            roomCode: roomCode
        });

        setNewMessage("");
    };

    const handleStartExam = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!examPdf || (!examPdf.type.includes("pdf") && !examPdf.name.toLowerCase().endsWith(".pdf"))) {
            setUploadError("Choose a PDF file to start the exam.");
            return;
        }

        const formData = new FormData(event.currentTarget);
        if (!roomCode) {
            setUploadError("Room code is missing.");
            return;
        }

        setIsCreatingExam(true);
        const created = await createExam({
            courseId: String(formData.get("courseId")),
            roomCode,
            title: String(formData.get("title")),
            durationMinutes: Number(formData.get("durationMinutes")),
            totalMarks: Number(formData.get("totalMarks")),
            file: examPdf,
        });
        setIsCreatingExam(false);

        if (!created) {
            setUploadError("Exam could not be created. Please try again.");
            return;
        }

        const createdExam = useExamStore.getState().exam;
        if (!createdExam?._id) {
            setUploadError("Exam details were not returned. Please try again.");
            return;
        }

        socket.emit("start-exam", { roomCode, examId: createdExam._id }, (result: { ok: boolean; message?: string }) => {
            if (!result.ok) {
                setUploadError(result.message || "The exam could not be started.");
            }
        });
    };

    return (
        <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-slate-100 text-slate-900">
            <header className="shrink-0 border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex items-center justify-between gap-4 py-4">
                        <div className="min-w-0">
                            <button type="button" onClick={() => navigate("/home")} className="mb-1 text-sm font-medium text-emerald-800 hover:text-emerald-950">
                                &larr; Back to rooms
                            </button>
                            <h1 className="truncate text-xl font-semibold">{roomName || "Study room"}</h1>
                            <p className="mt-0.5 text-sm text-slate-500">Room code <span className="font-mono font-semibold text-slate-700">{roomCode}</span></p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 sm:gap-3 sm:px-3 sm:py-2">
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-900 text-sm font-bold text-white">
                                    {currentUser?.name?.trim().charAt(0).toUpperCase() || "S"}
                                </span>
                                <div className="min-w-0">
                                    <p className="max-w-28 truncate text-xs font-semibold text-slate-800 sm:max-w-48 sm:text-sm">{currentUser?.name || "Student"}</p>
                                    <p className="hidden max-w-48 truncate text-xs text-slate-500 sm:block">{currentUser?.email || "Signed in"}</p>
                                </div>
                            </div>
                            {hasResult ? null : (
                                <button
                                    type="button"
                                    onClick={() => { setUploadError(""); setExamPdf(null); setIsExamModalOpen(true); }}
                                    className="rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
                                >
                                    Start exam
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto border-t border-slate-100 py-2.5" aria-live="polite">
                        <span className="shrink-0 text-xs font-semibold text-slate-500">
                            Online · {onlineStudents.length}
                        </span>
                        <div className="flex min-w-0 items-center gap-2">
                            {onlineStudents.length ? onlineStudents.map((student) => (
                                <span
                                    key={student._id}
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-950"
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                    {student._id === currentUser?._id ? `${student.name} (you)` : student.name}
                                </span>
                            )) : (
                                <span className="shrink-0 text-xs text-slate-400">Waiting for students to connect</span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <section className={`mx-auto grid min-h-0 w-full max-w-7xl flex-1 gap-5 overflow-hidden px-4 py-4 sm:px-6 lg:py-6 ${hasResult ? "grid-rows-[minmax(14rem,0.8fr)_minmax(0,1.2fr)] lg:grid-cols-[minmax(17rem,0.78fr)_minmax(0,1.5fr)] lg:grid-rows-1" : "lg:grid-cols-[minmax(0,1fr)_260px]"}`}>
                <section aria-label="Room discussion" className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white ${hasResult ? "rounded-2xl" : ""}`}>
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold">Room discussion</h2>
                        <p className="mt-1 text-sm text-slate-500">Share questions and work through the material together.</p>
                    </div>
                    {socketError && (
                        <div className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-800" role="alert">
                            {socketError}
                            <button type="button" onClick={() => { setSocketError(""); socket.connect(); }} className="ml-2 font-semibold underline underline-offset-2">Reconnect</button>
                        </div>
                    )}

                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5" aria-live="polite">
                        {allMessages.length === 0 ? (
                            <div className="grid min-h-64 place-items-center text-center">
                                <div>
                                    <p className="font-medium text-slate-800">Start the discussion</p>
                                    <p className="mt-1 text-sm text-slate-500">Messages from your room will appear here.</p>
                                </div>
                            </div>
                        ) : allMessages.map((message) => {
                            const isOwnMessage = message.userId._id === currentUser?._id;
                            return (
                                <article key={message._id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[min(85%,42rem)] rounded-lg px-4 py-3 ${isOwnMessage ? "bg-emerald-800 text-white" : "bg-slate-100 text-slate-900"}`}>
                                        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                            <p className={`text-xs font-semibold ${isOwnMessage ? "text-emerald-100" : "text-slate-600"}`}>{isOwnMessage ? "You" : message.userId.name}</p>
                                            <time className={`text-xs ${isOwnMessage ? "text-emerald-100" : "text-slate-500"}`}>
                                                {new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                                            </time>
                                        </div>
                                        <p className="whitespace-pre-wrap break-words text-sm">{message.message}</p>
                                    </div>
                                </article>
                            );
                        })}
                        <div ref={messagesEnd} />
                    </div>

                    <div className="min-h-6 px-5 text-xs text-slate-500" aria-live="polite">
                        {typingUser ? `${typingUser} is typing...` : " "}
                    </div>
                    <form onSubmit={sendMessage} className="flex items-end gap-3 border-t border-slate-200 p-4 sm:p-5">
                        <input
                            aria-label="Write a message"
                            type="text"
                            value={newMessage}
                            placeholder="Write a message..."
                            disabled={!isRoomJoined}
                            onChange={(e) => {
                                if (roomCode) socket.emit("typing", { roomCode });
                                setNewMessage(e.target.value);
                            }}
                            className="min-w-0 flex-1 rounded-md border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 disabled:bg-slate-100"
                        />
                        <button type="submit" aria-label="Send message" disabled={!isRoomJoined || !newMessage.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-emerald-800 text-white hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300">
                            <GrSend aria-hidden="true" />
                        </button>
                    </form>
                </section>

                {!hasResult && <aside className="hidden space-y-4 lg:block">
                    <section className="rounded-lg border border-slate-200 bg-white p-5">
                        <h2 className="font-semibold">Study session</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">Keep your notes nearby and use the discussion to compare approaches with your classmates.</p>
                        <button type="button" onClick={() => { setUploadError(""); setExamPdf(null); setIsExamModalOpen(true); }} className="mt-4 w-full rounded-md border border-emerald-800 px-4 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-50">
                            Prepare an exam PDF
                        </button>
                    </section>
                    <section className="rounded-lg border border-slate-200 bg-white p-5">
                        <h2 className="font-semibold">Room connection</h2>
                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                            <span className={`h-2 w-2 rounded-full ${isRoomJoined ? "bg-emerald-600" : socketError ? "bg-rose-600" : "bg-amber-500"}`} />
                            {isRoomJoined ? "You are connected to this room" : socketError || "Joining the room..."}
                        </p>
                    </section>
                </aside>}
                {hasResult && <Overview />}
            </section>

            {isExamModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsExamModalOpen(false); }}>
                    <section role="dialog" aria-modal="true" aria-labelledby="exam-upload-title" className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 id="exam-upload-title" className="text-xl font-semibold">Start an exam</h2>
                                <p className="mt-1 text-sm text-slate-600">Enter the exam details and choose its PDF.</p>
                            </div>
                            <button type="button" onClick={() => setIsExamModalOpen(false)} aria-label="Close exam dialog" className="rounded-md px-2 py-1 text-2xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-900">&times;</button>
                        </div>
                        <form onSubmit={handleStartExam} className="mt-5 space-y-4">
                            <label htmlFor="exam-course-id" className="block text-sm font-medium text-slate-700">
                                Course ID
                                <select
                                    id="exam-course-id"
                                    name="courseId"
                                    required
                                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                                >
                                    <option value="">Select Course</option>
                                    {courses?.map((course) => (
                                        <option key={course._id} value={course._id}>{course.name}</option>
                                    ))}
                                </select>
                            </label>
                            <label htmlFor="exam-room-code" className="block text-sm font-medium text-slate-700">
                                Room code
                                <input id="exam-room-code" name="roomCode" type="text" value={roomCode ?? ""} readOnly required className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600" />
                            </label>
                            <label htmlFor="exam-title" className="block text-sm font-medium text-slate-700">
                                Exam title
                                <input id="exam-title" name="title" type="text" required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15" />
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <label htmlFor="exam-duration" className="block text-sm font-medium text-slate-700">
                                    Duration (minutes)
                                    <input id="exam-duration" name="durationMinutes" type="number" min="1" required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15" />
                                </label>
                                <label htmlFor="exam-total-marks" className="block text-sm font-medium text-slate-700">
                                    Total marks
                                    <input id="exam-total-marks" name="totalMarks" type="number" min="0" required className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15" />
                                </label>
                            </div>
                            <label htmlFor="exam-pdf" className="block rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-emerald-700">
                                <span className="block font-medium text-slate-800">{examPdf ? examPdf.name : "Select an exam PDF"}</span>
                                <span className="mt-1 block text-sm text-slate-500">PDF files only</span>
                                <input id="exam-pdf" type="file" accept="application/pdf,.pdf" required className="mt-4 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-800 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-emerald-900" onChange={(event) => { setExamPdf(event.target.files?.[0] ?? null); setUploadError(""); }} />
                            </label>
                            {uploadError && <p className="text-sm text-rose-700" role="alert">{uploadError}</p>}
                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                                <button type="button" onClick={() => setIsExamModalOpen(false)} className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={isCreatingExam} className="rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60">{isCreatingExam ? "Creating exam..." : "Create exam"}</button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
            <Toaster />
        </main>
    );
}

export default RoomChat;