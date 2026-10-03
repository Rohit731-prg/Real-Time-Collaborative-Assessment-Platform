import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
    apiKey: process.env.COHERE_API_KEY,
});

export const reRank = async (documents, query) => {
    const response = await cohere.rerank({
        query: query,
        documents: documents,
    });
    return response;
};