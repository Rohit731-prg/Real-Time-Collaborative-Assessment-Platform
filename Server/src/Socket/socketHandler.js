import { isObjectIdOrHexString } from "mongoose";
import { DiscussionMessage } from "../Models/DiscussionMessageSchema.js";
import { RoomMembership } from "../Models/RoomMembershipSchema.js";
import { Room } from "../Models/RoomSchema.js";
import { Student } from "../Models/StudentSchema.js";
import { Exam } from "../Models/ExamSchema.js";
import { Question } from "../Models/QuestionSchema.js";

export const socketHandler = async (io) => {
    const emitOnlineStudents = async (roomCode) => {
        const roomSockets = await io.in(roomCode).fetchSockets();
        const studentIds = [...new Set(
            roomSockets
                .map((roomSocket) => roomSocket.data.studentId)
                .filter(Boolean)
        )];
        const students = await Student.find({ _id: { $in: studentIds } }).select("_id name");

        io.to(roomCode).emit("online-students", students.map((student) => ({
            _id: student._id.toString(),
            name: student.name,
        })));
    };

    io.on("connection", async (socket) => {
        const user = socket.user;


        // Store the room this socket has joined
        let joinedRoomCode = null;

        // =========================
        // JOIN ROOM
        // =========================

        socket.on("join-room", async ({ roomCode }) => {
            console.log("JOIN EVENT RECEIVED:", roomCode);

            const user = await Student.findById(socket.user._id).select("_id name");

            const room = await Room.findOne({ roomCode });

            if (!room) {
                console.log("ROOM NOT FOUND");
                return socket.emit("error", "Room not found");
            }

            const membership = await RoomMembership.findOne({
                roomId: room._id,
                userId: user._id,
            });

            if (!membership && !room.creatorId.equals(user._id)) {
                console.log("MEMBERSHIP NOT FOUND");
                return socket.emit("error", "You are not a member of this room");
            }

            joinedRoomCode = room.roomCode;
            socket.data.studentId = user._id.toString();

            socket.join(room.roomCode);

            console.log("SOCKET JOINED ROOM:", room.roomCode);
            console.log("SOCKET ROOMS:", socket.rooms);

            socket.emit("room-joined", {
                message: "Room joined successfully",
            });
            await emitOnlineStudents(room.roomCode);
        });

        socket.on("send-message", async ({ message, roomCode }) => {
            console.log("1. SEND EVENT:", message, roomCode);

            const user = await Student.findById(socket.user._id).select("_id name");

            console.log("2. USER:", user?._id);

            const room = await Room.findOne({ roomCode });

            console.log("3. ROOM:", room?.roomCode);

            // keep your existing membership check...

            const newMessage = new DiscussionMessage({
                roomId: room._id,
                userId: user._id,
                message,
            });

            await newMessage.save();

            console.log("4. MESSAGE SAVED");

            io.to(roomCode).emit("received-message", {
                message,
                sender: {
                    _id: user._id,
                    name: user.name,
                },
            });

            console.log("5. MESSAGE EMITTED:", roomCode);
        });

        socket.on("typing", async ({ roomCode }) => {
            console.log("TYPING EVENT:", roomCode);

            const user = await Student.findById(socket.user._id).select("_id name");

            if (!user) {
                return;
            }

            io.to(roomCode).emit("user-typing", {
                _id: user._id,
                name: user.name,
            });
        });

        socket.on("start-exam", async ({ roomCode, examId }, acknowledge) => {
            try {
                const room = await Room.findOne({ roomCode });
                if (!room) {
                    return acknowledge({ ok: false, message: "Room not found" });
                }

                const exam = await Exam.findById(examId);
                if (!exam || !exam.roomId.equals(room._id)) {
                    return acknowledge({ ok: false, message: "Exam not found in this room" });
                }
                if (!exam.createdBy.equals(socket.user._id)) {
                    return acknowledge({ ok: false, message: "You are not allowed to start this exam" });
                }
                if (room.currentExamId && !room.currentExamId.equals(exam._id)) {
                    return acknowledge({ ok: false, message: "Another exam is already active" });
                }

                const question = await Question.findOne({ examId: exam._id });
                if (!question) {
                    return acknowledge({ ok: false, message: "Exam questions were not found" });
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
                acknowledge({ ok: true });
            } catch (error) {
                console.error("Failed to start exam:", error);
                acknowledge({ ok: false, message: "The exam could not be started" });
            }
        });

        socket.on("disconnect", async () => {
            if (joinedRoomCode) {
                await emitOnlineStudents(joinedRoomCode);
            }
        });
    })
}