import { Document } from "@langchain/core/documents";

export const convertDocument = (chunk, user_id, course_id, room_id, exam_id) => {
    return new Document({
        pageContent: chunk,
        metadata: {
            user_id: String(user_id),
            course_id: String(course_id),
            room_id: String(room_id),
            exam_id: String(exam_id),
        }
    })
};