import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

import { llm } from "./llm.js";

const examSchema = z.array(
  z.object({
    question: z.string(),
    marks: z.number(),
    expectedAnswer: z.string(),
    userAnswer: z.string().default(""),
    topic: z.string(),
    difficulty: z.enum(["easy", "medium", "hard"]),
  })
);

const structuredLLM = llm.withStructuredOutput(examSchema);

const createExamPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Generate a Short Answer Question (SAQ) examination.

Use ONLY the provided course material.

Exam configuration:
- Number of questions: {questionCount}
- Marks per question: {marksPerQuestion}
- Difficulty: {difficulty}

Rules:
- Generate ONLY SAQs.
- No MCQs.
- No options.
- Every question must be answerable from the provided material.
- Do not invent facts outside the material.
- Include an expected answer.
- Include the topic.
- Use the requested difficulty.
- let userAnswer = ""; - means let it empty, user will fill it later.

Course material:
{context}`,
  ],
  [
    "human",
    "{question}",
  ],
]);

export const questionChain =
  createExamPrompt.pipe(structuredLLM);