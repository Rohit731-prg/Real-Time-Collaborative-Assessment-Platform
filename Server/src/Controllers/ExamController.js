import { PDFParse } from "pdf-parse";

import { Exam } from "../Models/ExamSchema.js";
import { Room } from "../Models/RoomSchema.js";
import { convertDocument } from "../Utils/Document.js";
import { textSplitter } from "../Utils/textSplitter.js";
import { embbiding } from "../Utils/embidding.js";
import { pineconeIndex } from "../Config/Pinecone.js";
import { questionChain } from "../Utils/createQuestion.js";

export const createExam = async (req, res) => {
    try {
        console.log("Body:", req.body);
        const file = req.file;
        if (!file) return res.status(400).json({ message: "File is required" });
        const parser = new PDFParse({ data: file.buffer });
        const pdfData = await parser.getText();
        await parser.destroy();

        const pdfText = pdfData.text;

        const { courseId, roomCode, title, durationMinutes, totalMarks } = req.body;
        if (!courseId || !roomCode || !title || !durationMinutes || !totalMarks) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const room = await Room.findOne({ roomCode: roomCode });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const exam = await Exam.create({
            courseId,
            roomId: room._id,
            title,
            createdBy: req.user._id,
            durationMinutes,
            totalMarks,
        });

        const document = convertDocument(pdfText, req.user._id, courseId, room._id, exam._id);
        const chunks = await textSplitter(document);
        const vectors = await embbiding.embedDocuments(chunks.map((chunk) => chunk.pageContent));
        await pineconeIndex.upsert({ vectors });

        const aiResponse = await questionChain.invoke({
            context: pdfText,
            questionCount: 10,
            marksPerQuestion: 5,
            difficulty: "medium",
            question: "Generate the examination."
        });
        return res.status(201).json({ message: "Exam created successfully", exam, aiResponse: aiResponse.content });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}   