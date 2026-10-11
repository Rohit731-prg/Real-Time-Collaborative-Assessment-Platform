
import { DiscussionMessage } from "../Models/DiscussionMessageSchema.js";
import { RoomMembership } from "../Models/RoomMembershipSchema.js";
import { Room } from "../Models/RoomSchema.js";
import { Student } from "../Models/StudentSchema.js";
import { Exam } from "../Models/ExamSchema.js";
import { Question } from "../Models/QuestionSchema.js";

export const socketHandler = async (io) => {
    const emitOnlineStudents = async (roomCode) => {
        const roomSockets = await io.in(roomCode).fetchSockets();

        const studentIds = [
            ...new Set(
                roomSockets
                    .map((roomSocket) => roomSocket.data.studentId)
                    .filter(Boolean)
            ),
        ];

        const students = await Student.find({
            _id: { $in: studentIds },
        }).select("_id name");

        io.to(roomCode).emit(
            "online-students",
            students.map((student) => ({
                _id: student._id.toString(),
                name: student.name,
            }))
        );
    };

    // Check room membership. The creator is also allowed.
    const isRoomMember = async (userId, room) => {
        if (String(room.creatorId) === String(userId)) {
            return true;
        }

        const membership = await RoomMembership.findOne({
            roomId: room._id,
            userId,
        });

        return Boolean(membership);
    };

    io.on("connection", (socket) => {
        // Per-socket event rate limiter
        const eventWindows = new Map();

        const isRateLimited = (eventName, limit, windowMs) => {
            const now = Date.now();
            let entry = eventWindows.get(eventName);

            if (!entry || now - entry.start >= windowMs) {
                entry = { start: now, count: 0 };
            }

            if (entry.count >= limit) {
                eventWindows.set(eventName, entry);
                return true;
            }

            entry.count++;
            eventWindows.set(eventName, entry);

            return false;
        };

        const notifyRateLimit = (message) => {
            socket.emit("rate-limit", { message });
        };

        let joinedRoomCode = null;

        // =========================
        // JOIN ROOM
        // =========================

        socket.on("join-room", async ({ roomCode } = {}) => {
            try {
                if (isRateLimited("join-room", 5, 60_000)) {
                    return notifyRateLimit(
                        "Too many room join attempts. Please wait."
                    );
                }

                if (typeof roomCode !== "string" || !roomCode.trim()) {
                    return socket.emit("error", "Invalid room code");
                }

                const user = await Student.findById(socket.user._id)
                    .select("_id name");

                if (!user) {
                    return socket.emit("error", "User not found");
                }

                const room = await Room.findOne({ roomCode });

                if (!room) {
                    return socket.emit("error", "Room not found");
                }

                const allowed = await isRoomMember(user._id, room);

                if (!allowed) {
                    return socket.emit(
                        "error",
                        "You are not a member of this room"
                    );
                }

                if (room.maxParticipants <= room.currentParticipants) {
                    return socket.emit("error", "Room is full");
                }

                room.currentParticipants++;
                await room.save();

                joinedRoomCode = room.roomCode;
                socket.data.studentId = user._id.toString();

                socket.join(room.roomCode);

                socket.emit("room-joined", {
                    message: "Room joined successfully",
                });

                await emitOnlineStudents(room.roomCode);
            } catch (error) {
                console.error("Join room failed:", error);
                socket.emit("error", "Unable to join room");
            }
        });

        // =========================
        // SEND MESSAGE
        // =========================

        socket.on("send-message", async ({ message, roomCode } = {}) => {
            try {
                if (isRateLimited("send-message", 10, 10_000)) {
                    return notifyRateLimit(
                        "You're sending messages too quickly."
                    );
                }

                if (
                    typeof message !== "string" ||
                    !message.trim() ||
                    message.length > 2000
                ) {
                    return socket.emit("error", "Invalid message");
                }

                if (typeof roomCode !== "string" || !roomCode.trim()) {
                    return socket.emit("error", "Invalid room code");
                }

                const user = await Student.findById(socket.user._id)
                    .select("_id name");

                if (!user) {
                    return socket.emit("error", "User not found");
                }

                const room = await Room.findOne({ roomCode });

                if (!room) {
                    return socket.emit("error", "Room not found");
                }
                if (!room.settings.allowChat) {
                    return socket.emit("error", "You can't chat in this room");
                }

                const allowed = await isRoomMember(user._id, room);

                if (!allowed) {
                    return socket.emit(
                        "error",
                        "You are not a member of this room"
                    );
                }

                const newMessage = new DiscussionMessage({
                    roomId: room._id,
                    userId: user._id,
                    message: message.trim(),
                });

                await newMessage.save();

                io.to(room.roomCode).emit("received-message", {
                    message: message.trim(),
                    sender: {
                        _id: user._id,
                        name: user.name,
                    },
                });
            } catch (error) {
                console.error("Send message failed:", error);
                socket.emit("error", "Unable to send message");
            }
        });

        // =========================
        // TYPING INDICATOR
        // =========================

        socket.on("typing", async ({ roomCode } = {}) => {
            try {
                if (isRateLimited("typing", 5, 3_000)) {
                    return;
                }

                if (typeof roomCode !== "string" || !roomCode.trim()) {
                    return;
                }

                const user = await Student.findById(socket.user._id)
                    .select("_id name");

                if (!user) return;

                const room = await Room.findOne({ roomCode });

                if (!room) return;

                const allowed = await isRoomMember(user._id, room);

                if (!allowed) return;

                io.to(room.roomCode).emit("user-typing", {
                    _id: user._id,
                    name: user.name,
                });
            } catch (error) {
                console.error("Typing event failed:", error);
            }
        });

        // =========================
        // START EXAM
        // =========================

        socket.on(
            "start-exam",
            async ({ roomCode, examId } = {}, acknowledge) => {
                const reply =
                    typeof acknowledge === "function"
                        ? acknowledge
                        : () => { };

                try {
                    if (isRateLimited("start-exam", 3, 60_000)) {
                        return reply({
                            ok: false,
                            message:
                                "Too many attempts. Please wait before trying again.",
                        });
                    }

                    if (
                        typeof roomCode !== "string" ||
                        !roomCode.trim() ||
                        !examId
                    ) {
                        return reply({
                            ok: false,
                            message: "Room code and exam ID are required",
                        });
                    }

                    const room = await Room.findOne({ roomCode });

                    if (!room) {
                        return reply({
                            ok: false,
                            message: "Room not found",
                        });
                    }

                    const allowed = await isRoomMember(
                        socket.user._id,
                        room
                    );

                    if (!allowed) {
                        return reply({
                            ok: false,
                            message: "You are not a member of this room",
                        });
                    }

                    const exam = await Exam.findById(examId);

                    if (!exam || !exam.roomId.equals(room._id)) {
                        return reply({
                            ok: false,
                            message: "Exam not found in this room",
                        });
                    }

                    if (
                        room.currentExamId &&
                        !room.currentExamId.equals(exam._id)
                    ) {
                        return reply({
                            ok: false,
                            message: "Another exam is already active",
                        });
                    }

                    const question = await Question.findOne({
                        examId: exam._id,
                    });

                    if (!question) {
                        return reply({
                            ok: false,
                            message: "Exam questions were not found",
                        });
                    }

                    room.currentExamId = exam._id;
                    room.status = "exam";

                    await room.save();

                    io.to(room.roomCode).emit("exam-started", {
                        roomCode: room.roomCode,
                        examId: exam._id.toString(),
                        exam: exam.toObject(),
                        question: question.toObject(),
                        questions: question.questionText,
                    });

                    return reply({ ok: true });
                } catch (error) {
                    console.error("Failed to start exam:", error);

                    return reply({
                        ok: false,
                        message: "The exam could not be started",
                    });
                }
            }
        );

        // =========================
        // DISCONNECT
        // =========================

        socket.on("disconnect", async () => {
            try {
                if (joinedRoomCode) {
                    await emitOnlineStudents(joinedRoomCode);
                }
            } catch (error) {
                console.error("Disconnect cleanup failed:", error);
            }
        });
    });
};