import { PDFParse } from "pdf-parse";

import { Exam } from "../Models/ExamSchema.js";
import { Room } from "../Models/RoomSchema.js";
import { RoomMembership } from "../Models/RoomMembershipSchema.js";
import { convertDocument } from "../Utils/Document.js";
import { textSplitter } from "../Utils/textSplitter.js";
import { embbiding } from "../Utils/embidding.js";
import { pineconeIndex } from "../Config/Pinecone.js";
import { questionChain } from "../Utils/createQuestion.js";
import { Question } from "../Models/QuestionSchema.js";
import { overviewChain, resultChain } from "../Utils/createResult.js";
import { Answer } from "../Models/AnswerSchema.js";

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
        const embeddings = await embbiding.embedDocuments(chunks.map((chunk) => chunk.pageContent));
        const records = chunks.map((chunk, index) => ({
            id: `${exam._id}-${index}`,
            values: embeddings[index],
            metadata: Object.fromEntries(
                Object.entries(chunk.metadata).map(([key, value]) => [key, String(value)])
            ),
        }));
        await pineconeIndex.upsert({ records });

        const aiResponse = await questionChain.invoke({
            context: pdfText,
            questionCount: 10,
            marksPerQuestion: 5,
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

        return res.status(201).json({
            message: "Exam submitted successfully",
            question: newQuestion,
            ai_response_overview: aiOverView,
            overview: aiOverView,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// export const getOverViewOnResult = async (req, res) => {
//     try {
//         const id = req.body;
//         if (!id) {
//             return res.status(400).json({ message: "Id is required" });
//         }
//         const answer = Answer.findById(req.params.answerId);
//         if (!answer) {
//             return res.status(404).json({ message: "Answer not found" });
//         }

//         const aiResponse = await overviewChain.invoke({
//             examQuestions: JSON.stringify({
//                 results: answer.answers,
//             }),
//         });

//         return res.status(200).json({
//             message: "Answer fetched successfully",
//             answer: aiResponse,
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// }