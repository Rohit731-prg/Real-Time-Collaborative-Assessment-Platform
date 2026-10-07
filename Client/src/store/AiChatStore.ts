import { create } from "zustand";
import { aiApi } from "../Utils/Axios";

export type AiChatMessage = {
    _id: string;
    role: "user" | "ai";
    content: string;
    createdAt: string;
};

export type AiChatContext = {
    questionId: string;
    examId: string;
    courseId: string;
    roomId: string;
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
    getAllMessage: (context: AiChatContext) => Promise<void>;
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

    getAllMessage: async (context) => {
        set({ messages: null });
        try {
            const { data } = await aiApi.post<{ aiChat: ApiMessage[] }>("/get", context);
            set({ messages: data.aiChat.map(toChatMessage) });
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
