import { Pinecone } from "@pinecone-database/pinecone";

export const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

export const pineconeIndex = pinecone.index("Real_Time_Collaborative_Assessment_Platform");