import { io } from "socket.io-client";

export const socket = io("https://real-time-collaborative-assessment-znef.onrender.com", {
    autoConnect: false,
    withCredentials: true
});