import { create } from "zustand";
import { aiApi } from "../Utils/Axios";

export type AiChatMessage = {
    _id: string;
    role: "user" | "ai";
    content: string;
    createdAt: string;
};

export type AiChatContextGet = {
    questionId: string;
    examId: string;
    courseId: string;
    roomId: string;
};

export type AiChatContext = AiChatContextGet & {
    answer: string;
};

type ApiMessage = {
    _id?: string;
    Message?: string;
    message?: string;
    role: "user" | "ai";
    createdAt?: string;
};

type AiChatState = {
    messages: AiChatMessage[] | null;
    getAllMessage: (examId: string) => Promise<void>;
    sendMessage: (context: AiChatContext, query: string) => Promise<void>;
};

const toChatMessage = (message: ApiMessage): AiChatMessage => ({
    _id: message._id ?? `${message.role}-${message.createdAt ?? Date.now()}`,
    role: message.role,
    content: message.Message ?? message.message ?? "",
    createdAt: message.createdAt ?? new Date().toISOString(),
});

const useAiChatStore = create<AiChatState>((set) => ({
    messages: null,

    getAllMessage: async (examId: string) => {
        set({ messages: null });
        try {
            const res = await aiApi.post("/get", {
                examId
            });
            set({ messages: res.data.aiChat.map(toChatMessage) });
        } catch (error) {
            set({ messages: [] });
            throw error;
        }
    },

    sendMessage: async (context, query) => {
        const { data } = await aiApi.post<{
            userChat: ApiMessage;
            aiChat: ApiMessage;
        }>("/add", { ...context, query });

        set((state) => ({
            messages: [
                ...(state.messages ?? []),
                toChatMessage(data.userChat),
                toChatMessage(data.aiChat),
            ],
        }));
    },
}));

export default useAiChatStore;
