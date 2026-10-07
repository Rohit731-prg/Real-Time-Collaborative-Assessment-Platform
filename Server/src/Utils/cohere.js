import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
    token: process.env.CO_API_KEY,
});

export const reRank = async (documents, query) => {
    const response = await cohere.rerank({
        query: query,
        documents: documents,
        returnDocuments: true,
    });
    return response;
};