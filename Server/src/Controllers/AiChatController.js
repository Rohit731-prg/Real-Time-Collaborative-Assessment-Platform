import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AiChat } from "../Models/AiChatSchema.js";
import { reRank } from "../Utils/cohere.js";
import { rephraseQuestion } from "../Utils/qurryRewriter.js";
import { vecterStore } from "../Utils/vecterStore.js";
import { llm } from "../Utils/llm.js";

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
        const { questionId, examId, courseId, roomId } = req.body;
        if (!questionId || !examId || !courseId || !roomId) {
            return res.status(400).json({ message: "Assessment details are required." });
        }

        const aiChat = await AiChat.find(
            getChatFilter({ questionId, examId, courseId, roomId, userId: req.user._id })
        ).sort({ createdAt: 1 });

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
        const previousMessages = await AiChat.find(chatFilter)
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
                course_id: courseId,
                room_id: roomId,
                exam_id: examId,
            },
        }).invoke(standaloneQuestion);
        const rankedDocuments = documents.length
            ? await reRank(documents.map((document) => document.pageContent), standaloneQuestion)
            : { results: [] };
        const context = rankedDocuments.results
            .map((document) => document.document)
            .join("\n");

        const aiResponse = await llm.invoke([
            new SystemMessage(
                `You are a helpful assessment tutor. Answer the student's question using the assessment context below. Explain concepts clearly for a student and do not invent information.\n\nAssessment context:\n${context || answerText}`
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
