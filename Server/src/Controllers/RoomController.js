import mongoose from "mongoose";
import { RoomMembership } from "../Models/RoomMembershipSchema.js";
import { Room } from "../Models/RoomSchema.js";

export const createRoom = async (req, res) => {
    const { courseId, name, description, maxParticipants, settings } = req.body;
    if (!courseId || !name || !description || !maxParticipants || !settings) {
        return res.status(400).json({ message: "All details are require" });
    }
    try {
        const user = req.user;
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newRoom = new Room({
            courseId,
            name,
            creatorId: user._id,
            roomCode: code,
            description,
            maxParticipants,
            settings,
        });
        await newRoom.save();
        return res.status(201).json({ code });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

export const joinRoom = async (req, res) => {
    const { roomCode } = req.body;
    if (!roomCode) {
        return res.status(400).json({ message: "Room code is required" });
    }
    try {
        const user = req.user;
        const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        if (room.status === "closed" || room.status === "completed") {
            return res.status(400).json({ message: "Room is closed or completed" });
        }
        // if (room.currentExamId) {
        //     return res.status(400).json({ message: "Room is already in progress" });
        // }

        const membershipFilter = { roomId: room._id, userId: user._id };
        const existingMembership = await RoomMembership.findOne(membershipFilter);
        if (existingMembership) {
            return res.status(200).json({ room: room.roomCode });
        }

        const participantCount = await RoomMembership.countDocuments({ roomId: room._id });
        if (participantCount >= room.maxParticipants) {
            return res.status(400).json({ message: "Room is full" });
        };

        const membership = new RoomMembership({
            roomId: room._id,
            userId: user._id,
            role: "participant",
        });
        try {
            await membership.save();
        } catch (error) {
            if (error.code === 11000 && await RoomMembership.exists(membershipFilter)) {
                return res.status(200).json({ room: room.roomCode });
            }
            throw error;
        }

        return res.status(200).json({ room: room.roomCode });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

export const getAllRooms = async (req, res) => {
    try {
        const user = req.user;
        const rooms = await Room.find({ creatorId: user._id });
        if (!rooms) {
            return res.status(404).json({ message: "No rooms found" });
        }
        return res.status(200).json({ rooms });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getRoomDetails = async (req, res) => {
    try {
        const room = await Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const isCreator = room.creatorId.equals(req.user._id);
        const isMember = await RoomMembership.exists({ roomId: room._id, userId: req.user._id });
        if (!isCreator && !isMember) {
            return res.status(403).json({ message: "You are not a member of this room" });
        }

        return res.status(200).json({
            room: {
                name: room.name,
                roomCode: room.roomCode,
            },
        });
    } catch (error) {
        console.error("Failed to get room details:", error);
        return res.status(500).json({ message: "Failed to get room details" });
    }
};

export const getAllJoinedRooms = async (req, res) => {
    console.log("api called...!");
    try {
        const userId = req.user._id;

        const rooms = await RoomMembership.aggregate([
            // 1. Find memberships belonging to current user
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },

            // 2. Get the actual Room
            {
                $lookup: {
                    from: "rooms",
                    localField: "roomId",
                    foreignField: "_id",
                    as: "room"
                }
            },

            // 3. Convert room array into object
            {
                $unwind: "$room"
            },

            // 4. Remove rooms created by the current user
            {
                $match: {
                    "room.creatorId": {
                        $ne: new mongoose.Types.ObjectId(userId)
                    }
                }
            },

            // 5. Get creator information
            {
                $lookup: {
                    from: "students",
                    localField: "room.creatorId",
                    foreignField: "_id",
                    as: "creator"
                }
            },

            {
                $unwind: {
                    path: "$creator",
                    preserveNullAndEmptyArrays: true
                }
            },

            // 6. Return only what frontend needs
            {
                $project: {
                    _id: "$room._id",
                    name: "$room.name",
                    roomCode: "$room.roomCode",
                    status: "$room.status",
                    description: "$room.description",
                    maxParticipants: "$room.maxParticipants",
                    creatorId: "$room.creatorId",
                    creator: {
                        name: "$creator.name",
                        email: "$creator.email",
                        avatar: "$creator.avatar"
                    }
                }
            },

            // 7. Latest joined rooms first
            {
                $sort: {
                    _id: -1
                }
            }
        ]);

        console.log(rooms);
        return res.status(200).json({ rooms });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: error.message
        });
    }
};