import { create } from "zustand";
import { messageApi } from "../Utils/Axios";
import toast from "react-hot-toast";

type Message = {
	_id: string;
	roomId: string;
	userId: {
		_id: string;
		name: string;
	};
	message: string;
	createdAt: string;
	updatedAt: string;
};

type Store = {
	messages: Message[];
	getMessage: (roomCode: string) => Promise<boolean>;
};

const useMessageStore = create<Store>()((set) => ({
	messages: [],

	getMessage: async (roomCode: string) => {
		try {
			const response = messageApi.post("/get", { roomCode });

			toast.promise(response, {
				loading: "Loading messages...",
				success: "Messages loaded",
				error: (err) =>
					err.response?.data?.message ||
					err.message ||
					"Internal Server Error",
			});

			const res = await response;
			set({ messages: res.data.messages });
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	},
}));

export default useMessageStore;
