import { ChatPromptTemplate } from "@langchain/core/prompts";
import { llm } from "./llm.js";

const standaloneQurry = ChatPromptTemplate.fromMessages([
    ["system", `You are a query rewriting assistant.

Given the conversation history and the user's latest question,
rewrite the latest question into a standalone question.

The rewritten question must:
- preserve the user's original intent
- resolve references such as "it", "this", "that", etc.
- contain enough context to be understood without the conversation history

Return ONLY the rewritten question.`],
    ["human", `Conversation history:
{history}

Latest question:
{question}`],
]);

const standaloneQurryChain = standaloneQurry.pipe(llm)

const getTextContent = (content) => {
    if (typeof content === "string") return content.trim();

    if (Array.isArray(content)) {
        return content
            .filter(part => typeof part === "string" || typeof part?.text === "string")
            .map(part => typeof part === "string" ? part : part.text)
            .join("")
            .trim();
    }

    return typeof content?.text === "string" ? content.text.trim() : "";
};

export const rephraseQuestion = async (history, question) => {
    const originalQuestion = typeof question === "string" ? question.trim() : "";
    if (!originalQuestion) throw new Error("A non-empty question is required");

    const historyText = history
        .map(message => `${message.role}: ${message.content}`)
        .join("\n");


    const response = await standaloneQurryChain.invoke({
        history: historyText,
        question: originalQuestion
    });

    const rewrittenQuestion = getTextContent(response.content);
    return rewrittenQuestion || originalQuestion;
}