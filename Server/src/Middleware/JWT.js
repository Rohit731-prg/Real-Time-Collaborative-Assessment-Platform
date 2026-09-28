import jwt from "jsonwebtoken";
import { Student } from "../Models/StudentSchema.js";

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: "Token is invalid" });
        }

        const user = await Student.findById(decoded._id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: err.message });
    }
}