import express from "express";
import { createRoom, getAllRooms, getRoomDetails, joinRoom } from "../Controllers/RoomController.js";
import { verifyToken } from "../Middleware/JWT.js";

const router = express.Router();

router.use(verifyToken);
router.post("/create", createRoom);
router.post("/join", joinRoom);
router.get("/get", getAllRooms);
router.get("/:roomCode", getRoomDetails);

export const roomRouter = router;