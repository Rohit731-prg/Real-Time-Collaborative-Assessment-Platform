import "dotenv/config.js";
import express from "express"
import http from "http"
import { Server } from "socket.io";
import cookieParser from "cookie-parser"
import cors from "cors"
import jwt from "jsonwebtoken";

import { getServerOn } from "./server.js";
import { socketHandler } from "./Socket/socketHandler.js";
import { connectDB } from "./Config/ConnectDB.js";
import { studentRouter } from "./Routers/StudentRouter.js";
import { courseRouter } from "./Routers/CourseRouter.js";
import { roomRouter } from "./Routers/RoomRouter.js";
import MessageRouter from "./Routers/MessageRouter.js";
import examRouter from "./Routers/ExamRouter.js";

const PORT = process.env.PORT || 5000;
export const app = express()
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json())
app.use(cookieParser())

app.use("/api/student", studentRouter);
app.use("/api/course", courseRouter);
app.use("/api/room", roomRouter);
app.use("/api/message", MessageRouter);
app.use("/api/exam", examRouter);

export const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
})

io.use(async (socket, next) => {
    console.log("Server is connected to socket");
    try {
        const rawCookie = socket.handshake.headers.cookie;

        if (!rawCookie) {
            return next(new Error("No cookie"));
        }

        const token = rawCookie
            .split("; ")
            .find((cookie) => cookie.startsWith("token="))
            ?.split("=")[1];

        if (!token) {
            return next(new Error("Token missing"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        socket.user = decoded;

        next();
    } catch (error) {
        console.log("ERROR:", error);
        next(new Error("Unauthorized"));
    }
});

(async () => {
    await connectDB();
    getServerOn(PORT);
    socketHandler(io);
})();