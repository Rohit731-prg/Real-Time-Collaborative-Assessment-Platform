import jwt from "jsonwebtoken";

export const createToken = (userId) => {
    return jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};