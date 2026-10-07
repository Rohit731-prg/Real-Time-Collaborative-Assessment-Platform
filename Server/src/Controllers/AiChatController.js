import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AiChat } from "../Models/AiChatSchema.js";
import { reRank } from "../Utils/cohere.js";
import { rephraseQuestion } from "../Utils/qurryRewriter.js";
import { vecterStore } from "../Utils/vecterStore.js";
import { llm } from "../Utils/llm.js";
import { Question } from "../Models/QuestionSchema.js";
import { formatAssessmentQuestions } from "../Utils/formatAssessmentQuestions.js";

const getText = (content) => {
    if (typeof content === "string") return content.trim();
    if (Array.isArray(content)) {
        return content
            .map((part) => typeof part === "string" ? part : part?.text ?? "")
            .join("")
            .trim();
    }
    return "";
};

const getChatFilter = ({ questionId, examId, courseId, roomId, userId }) => ({
    questionId,
    examId,
    courseId,
    roomId,
    userId,
});

export const getAiChat = async (req, res) => {
    try {
        const { examId } = req.body;
        if (!examId) {
            return res.status(400).json({ message: "Exam is required." });
        }

        const aiChat = await AiChat.find({
            examId,
            userId: req.user._id,
        }).sort({ createdAt: 1 });

        const legacyMessages = aiChat.filter((message) =>
            message.role === "ai" && message.Message.includes("[object Object]")
        );
        if (legacyMessages.length) {
            const questionIds = [...new Set(legacyMessages.map((message) => message.questionId.toString()))];
            const questions = await Question.find({ _id: { $in: questionIds } }, { questionText: 1 });
            const questionsById = new Map(questions.map((question) => [
                question._id.toString(),
                question.questionText,
            ]));

            for (const message of legacyMessages) {
                const formattedQuestions = formatAssessmentQuestions(
                    questionsById.get(message.questionId.toString())
                );
                if (formattedQuestions) message.Message = formattedQuestions;
            }
        }

        return res.status(200).json({ aiChat });
    } catch (error) {
        console.error("Failed to load AI chat:", error);
        return res.status(500).json({ message: "Could not load chat history." });
    }
};

export const createAiChatResponse = async (req, res) => {
    try {
        const { questionId, examId, courseId, roomId, query, answer } = req.body;
        if (!questionId || !examId || !courseId || !roomId || !query?.trim()) {
            return res.status(400).json({ message: "Assessment details and a question are required." });
        }

        const answerText = answer || "Assessment preparation and discussion.";

        const chatFilter = getChatFilter({
            questionId,
            examId,
            courseId,
            roomId,
            userId: req.user._id,
        });
        const previousMessages = await AiChat.find({
            examId,
            userId: req.user._id,
        })
            .sort({ createdAt: -1 })
            .limit(10);
        const history = previousMessages.map((message) => ({
            role: message.role,
            content: message.Message,
        })).reverse();

        if (history.length === 0) {
            history.push({ role: "ai", content: answerText });
        }

        const standaloneQuestion = await rephraseQuestion(history, query.trim());
        const documents = await vecterStore.asRetriever({
            k: 10,
            filter: {
                course_id: String(courseId),
                room_id: String(roomId),
                exam_id: String(examId),
            },
        }).invoke(standaloneQuestion);
        if (!documents.length) {
            return res.status(503).json({
                message: "No indexed study material was found for this assessment. Please ask the assessment creator to upload the resource again.",
            });
        }

        const rankedDocuments = await reRank(
            documents.map((document) => document.pageContent),
            standaloneQuestion
        );
        const context = rankedDocuments.results
            .map((result) => result.document?.text ?? documents[result.index]?.pageContent ?? "")
            .filter((document) => typeof document === "string" && document.trim())
            .join("\n");
        if (!context) {
            return res.status(503).json({
                message: "The study material could not be prepared for this assessment. Please try again later.",
            });
        }

        const aiResponse = await llm.invoke([
            new SystemMessage(
                `You are a helpful assessment tutor. Answer the student's question using the assessment material below. Explain concepts clearly for a student and do not invent information. If the material does not answer the question, say so.\n\nAssessment material:\n${context}\n\nAssessment feedback:\n${answerText}`
            ),
            ...history.map((message) => message.role === "ai"
                ? new AIMessage(message.content)
                : new HumanMessage(message.content)),
            new HumanMessage(query.trim()),
        ]);
        const responseText = getText(aiResponse.content);
        if (!responseText) {
            throw new Error("The AI tutor returned an empty response.");
        }

        const userChat = await AiChat.create({
            ...chatFilter,
            Message: query.trim(),
            role: "user",
        });
        const aiChat = await AiChat.create({
            ...chatFilter,
            Message: responseText,
            role: "ai",
        });

        console.log("AI RESPONSE DEGUNNNNNN: ", aiChat);
        console.log("AI RESPONSE DEGUNNNNNN: ", userChat);

        return res.status(201).json({
            message: "AI response generated successfully.",
            userChat,
            aiChat,
        });
    } catch (error) {
        console.error("Failed to generate AI chat response:", error);
        return res.status(500).json({ message: "Could not generate an AI response." });
    }
};
