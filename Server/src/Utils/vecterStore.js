import { PineconeStore } from "@langchain/pinecone";

import { embbiding } from "./embidding.js";
import { pineconeIndex } from "../Config/Pinecone.js";

export const vecterStore = await PineconeStore.fromExistingIndex(
    embbiding,
    {
        pineconeIndex,

    }
);