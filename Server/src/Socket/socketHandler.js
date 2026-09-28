import { isObjectIdOrHexString } from "mongoose";
import { DiscussionMessage } from "../Models/DiscussionMessageSchema.js";
import { RoomMembership } from "../Models/RoomMembershipSchema.js";
import { Room } from "../Models/RoomSchema.js";
import { Student } from "../Models/StudentSchema.js";

export const socketHandler = async (io) => {
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

            if (!membership) {
                console.log("MEMBERSHIP NOT FOUND");
                return socket.emit("error", "You are not a member of this room");
            }

            joinedRoomCode = room.roomCode;

            socket.join(room.roomCode);

            console.log("SOCKET JOINED ROOM:", room.roomCode);
            console.log("SOCKET ROOMS:", socket.rooms);

            socket.emit("room-joined", {
                message: "Room joined successfully",
            });
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

        socket.on("disconnect", async ({ roomCode }) => {
            const student = await Student.findById(socket.user._id);
            io.to(roomCode).emit("user-left", {
                name: student.name,
            });
        });
    })
}