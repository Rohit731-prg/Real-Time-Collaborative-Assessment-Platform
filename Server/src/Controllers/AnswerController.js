import { Answer } from "../Models/AnswerSchema.js";

export const getAllAnswers = async (req, res) => {
    try {
        const { examId } = req.body;
        if (!examId) {
            return res.status(400).json({ message: "Exam ID is required" });
        }

        const answers = await Answer.find({ examId }).sort({ createdAt: 1 });
        if (!answers) {
            return res.status(404).json({ message: "Answers not found" });
        }
        return res.status(200).json({ answers });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}