import mongoose from "mongoose";
import "dotenv/config.js"

export const connectDB = async () => {
    try {
        const host = await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected", host.connection.host);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}