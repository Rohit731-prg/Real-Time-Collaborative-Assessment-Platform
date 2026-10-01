import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

import { llm } from "./llm.js";

const resultSchema = z.array(
    z.object({
        question: z.string(),
        correctAnswer: z.string(),
        studentAnswer: z.string(),
        marks: z.number(),
        comment: z.string(),
    })
);

const structuredLLM = llm.withStructuredOutput(resultSchema);

const createResultPrompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You are an expert teacher.

I will give you:
- Exam Questions
- Student Answers
- Expected Answers
- in Array format, go through them and evaluate thems

Your job:
- Evaluate each answer
- Assign marks (0 to max marks)
- Give a short comment (1-3 lines)
 - Return one result for each question, including the question, expected answer, student's answer, marks awarded, and a short comment.

Follow the required structured output. Do not include markdown or explanations.`
    ],
    ["human", "Evaluate these exam questions and student answers:\n{examQuestions}"]
]);


const overviewPrompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You are an expert teacher.

I will give you:
- Exam Questions
- Student Answers
- Expected Answers
- in Array format, go through them and evaluate thems

Your job:
- Evaluate each answer
- Assign marks (0 to max marks)
- Give a short comment (1-3 lines)
 - Return one result for each question, including the question, expected answer, student's answer, marks awarded, and a short comment.

 as a teacher give the overview of the result, what the student need to improve and what the student need to continue doing
 and return html with tailwind format that can be shown directly on browser.

Follow the required structured output. Do not include markdown or explanations.`
    ],
    ["human", "Evaluate these exam questions and student answers:\n{examQuestions}"]
]);


export const resultChain = createResultPrompt.pipe(structuredLLM);
export const overviewChain = overviewPrompt.pipe(llm);