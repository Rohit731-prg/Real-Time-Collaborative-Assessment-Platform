import { create } from "zustand";
import { roomApi } from "../Utils/Axios";
import toast from "react-hot-toast";

type RoomSignUp = {
    courseId: string;
    name: string;
    description: string;
    maxParticipants: number;
    settings: {
        allowChat: boolean;
        allowLateJoin: boolean;
        showLeaderboard: boolean;
    };
};

type Room = {
    _id: string;
    courseId: string;
    name: string;
    creatorId: string;
    description: string;
    roomCode: string;
    status: string;
    maxParticipants: number;
    settings: {
        allowChat: boolean;
        allowLateJoin: boolean;
        showLeaderboard: boolean;
    };
};

type Store = {
    rooms: Room[]

    createRoom: (data: RoomSignUp) => Promise<boolean | String>;
    joinRoom: (roomcode: string) => Promise<boolean>;
    getRoom: () => Promise<void>;
};

const useRoomStore = create<Store>()((set) => ({
    rooms: [],

    createRoom: async (data: RoomSignUp) => {
        try {
            const response = roomApi.post("/create", data);

            toast.promise(response, {
                loading: "Creating room...",
                success: (res) =>
                    res.data.message || "Room created successfully",
                error: (err) =>
                    err.response?.data?.message ||
                    err.message ||
                    "Internal Server Error",
            });

            const res = await response;

            console.log(res);

            return res.data.code;
        } catch (error) {
            console.log(error);
            return false;
        }
    },

    joinRoom: async (roomcode: string) => {
        try {
            const response = roomApi.post("/join", {
                roomCode: roomcode.trim().toUpperCase(),
            });

            toast.promise(response, {
                loading: "Joining room...",
                success: (res) =>
                    res.data.message || "Room joined successfully",
                error: (err) =>
                    err.response?.data?.message ||
                    err.message ||
                    "Internal Server Error",
            });

            const res = await response;

            console.log(res);

            return res.data.room;
        } catch (error) {
            console.log(error);
            return false;
        }
    },

    getRoom: async () => {
        try {
            const response = await roomApi.get("/get");
            set({ rooms: response.data.rooms });
        } catch (error) {
            console.log(error);
        }
    }
}));

export default useRoomStore;