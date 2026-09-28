import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const rcts = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
});

export const textSplitter = async (dosc_file) => {
    return await rcts.splitDocuments([dosc_file]);
};