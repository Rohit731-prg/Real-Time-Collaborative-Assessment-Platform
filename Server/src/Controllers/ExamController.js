import { PDFParse } from "pdf-parse";

import { Exam } from "../Models/ExamSchema.js";
import { Room } from "../Models/RoomSchema.js";
import { RoomMembership } from "../Models/RoomMembershipSchema.js";
import { convertDocument } from "../Utils/Document.js";
import { textSplitter } from "../Utils/textSplitter.js";
// import { embbiding } from "../Utils/embidding.js";
// import { pineconeIndex } from "../Config/Pinecone.js";
import { questionChain } from "../Utils/createQuestion.js";
import { Question } from "../Models/QuestionSchema.js";
import { overviewChain, resultChain } from "../Utils/createResult.js";
import { Answer } from "../Models/AnswerSchema.js";
import { vecterStore } from "../Utils/vecterStore.js";
import { AiChat } from "../Models/AiChatSchema.js";

export const createExam = async (req, res) => {
    try {
        console.log("Body:", req.body);
        const file = req.file;
        if (!file) return res.status(400).json({ message: "File is required" });
        const parser = new PDFParse({ data: file.buffer });
        const pdfData = await parser.getText();
        await parser.destroy();

        const pdfText = pdfData.text;
        if (!pdfText?.trim()) {
            return res.status(400).json({ message: "PDF contains no extractable text" });
        }

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
        await vecterStore.addDocuments(chunks);

        const marksPerQuestion = 5;
        const questionCount = Math.max(1, Math.floor(Number(totalMarks) / marksPerQuestion));

        const aiResponse = await questionChain.invoke({
            context: pdfText,
            questionCount,
            marksPerQuestion,
            difficulty: "medium",
            question: "Generate the examination."
        });
        console.log(aiResponse);

        const newQuestion = new Question({
            examId: exam._id,
            courseId,
            createrId: req.user._id,
            type: "medium",
            questionText: aiResponse,
        })
        await newQuestion.save();

        const newAiChat = new AiChat({
            userId: req.user._id,
            questionId: newQuestion._id,
            examId: exam._id,
            courseId: courseId,
            roomId: room._id,
            Message: String(aiResponse),
            role: "ai",
        })
        await newAiChat.save();

        console.log("Question Created: ", aiResponse);
        return res.status(201).json({ message: "Exam created successfully", exam, question: newQuestion });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getActiveExamForRoom = async (req, res) => {
    try {
        const room = await Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const isCreator = room.creatorId.equals(req.user._id);
        const isMember = await RoomMembership.exists({ roomId: room._id, userId: req.user._id });
        if (!isCreator && !isMember) {
            return res.status(403).json({ message: "You are not a member of this room" });
        }

        if (!room.currentExamId) {
            return res.status(404).json({ message: "No active exam in this room" });
        }

        const exam = await Exam.findById(room.currentExamId);
        const question = exam ? await Question.findOne({ examId: exam._id }) : null;
        if (!exam || !question) {
            return res.status(404).json({ message: "Active exam details not found" });
        }

        return res.status(200).json({
            exam,
            question,
            questions: question.questionText,
        });
    } catch (error) {
        console.error("Failed to get active exam:", error);
        return res.status(500).json({ message: "Failed to get active exam" });
    }
};

export const submitExam = async (req, res) => {
    try {
        const { questionId, examId, roomCode, answer } = req.body;
        if (!examId || !questionId || !answer || !roomCode) {
            return res.status(400).json({ message: "All fields are required" });
        }

        console.log("Answer from AI Response: ", answer);
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        const room = await Room.findOne({ roomCode });
        if (!room) return res.status(404).json({ message: "Room not found" });

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: "Exam not found" });

        question.attempted = true;
        await question.save();

        const newQuestion = new Question({
            examId,
            courseId: question.courseId,
            createrId: req.user._id,
            roomId: question.roomId,
            type: question.type,
            questionText: answer,
        })
        await newQuestion.save();

        const aiResponse = await resultChain.invoke({
            examQuestions: JSON.stringify({
                questions: question.questionText,
                studentAnswers: answer,
            }),
        });

        const newAnswer = new Answer({
            questionId: question._id,
            examId: exam._id,
            userId: req.user._id,
            roomId: room._id,
            answers: aiResponse,
        });
        await newAnswer.save();

        const aiOverView = await overviewChain.invoke({
            examQuestions: JSON.stringify({
                results: newAnswer.answers,
            }),
        });
        const overviewContent = aiOverView?.content ?? aiOverView;
        const overview = typeof overviewContent === "string"
            ? overviewContent
            : Array.isArray(overviewContent)
                ? overviewContent.map((part) => typeof part === "string" ? part : part.text ?? "").join("\n")
                : JSON.stringify(overviewContent) ?? "";

        console.log("Evaluation from AI: ", aiResponse);
        console.log("Overview from AI: ", aiOverView);

        return res.status(201).json({
            message: "Exam submitted successfully",
            question: newQuestion,
            overview,
            results: aiResponse,
            exam: {
                title: exam.title,
                totalMarks: exam.totalMarks,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllExamInfo = async (req, res) => {
    try {
        const { roomCode } = req.body;
        if (!roomCode) return res.status(400).json({ message: "Room code is required" });

        const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
        if (!room) return res.status(404).json({ message: "Room not found" });

        const exams = await Exam.find({ roomId: room._id }).sort({ createdAt: -1 });
        if (!exams) return res.status(404).json({ message: "Exam not found" });

        return res.status(200).json({ exam: exams });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}