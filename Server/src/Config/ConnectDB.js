import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const host = await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected", host.connection.host);
    } catch (error) {
        console.log(error);
    }
}