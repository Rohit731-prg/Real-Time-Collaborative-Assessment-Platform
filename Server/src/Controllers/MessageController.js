import { DiscussionMessage } from "../Models/DiscussionMessageSchema.js";
import { Room } from "../Models/RoomSchema.js";

export const getAllMessage = async (req, res) => {
    try {
        const { roomCode } = req.body;
        if (!roomCode) {
            return res.status(400).json({ message: "Room code is required" });
        }

        const room = await Room.findOne({ roomCode });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        const messages = await DiscussionMessage.find({ roomId: room._id }).populate("userId", "name");
        if (!messages) {
            return res.status(404).json({ message: "No messages found" });
        }
        return res.status(200).json({ messages });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}