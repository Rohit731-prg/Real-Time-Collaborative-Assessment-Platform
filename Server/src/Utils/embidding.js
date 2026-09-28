import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const embbiding = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001"
});