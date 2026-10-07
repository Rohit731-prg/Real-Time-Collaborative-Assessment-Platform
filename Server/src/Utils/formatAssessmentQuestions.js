export const formatAssessmentQuestions = (questions) => {
    if (!Array.isArray(questions)) return "";

    return questions
        .map((item, index) => {
            if (typeof item?.question !== "string" || !item.question.trim()) return "";

            const details = [
                item.topic ? `Topic: ${item.topic}` : "",
                item.difficulty ? `Difficulty: ${item.difficulty}` : "",
            ].filter(Boolean);

            return [
                `Question ${index + 1}: ${item.question.trim()}`,
                ...details,
            ].join("\n");
        })
        .filter(Boolean)
        .join("\n\n");
};
