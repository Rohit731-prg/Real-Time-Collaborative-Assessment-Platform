import { Document } from "@langchain/core/documents";

export const convertDocument = (chunk, user_id, course_id, room_id, exam_id) => {
    return new Document({
        pageContent: chunk,
        metadata: {
            user_id: user_id,
            course_id: course_id,
            room_id: room_id,
            exam_id: exam_id
        }
    })
};