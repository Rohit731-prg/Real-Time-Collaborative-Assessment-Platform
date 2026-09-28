import { Exam } from "../Models/ExamSchema.js";
import { Room } from "../Models/RoomSchema.js";

export const createExam = async (req, res) => {
    try {
        const { courseId, roomCode, title, durationMinutes, totalMarks } = req.body;
        if (!courseId || !roomCode || !title || !durationMinutes || !totalMarks) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const room = await Room.findOne({ code: roomCode });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const exam = await Exam.create({ courseId, roomId: room._id, title, durationMinutes, totalMarks });
        return res.status(201).json({ message: "Exam created successfully", exam });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}   