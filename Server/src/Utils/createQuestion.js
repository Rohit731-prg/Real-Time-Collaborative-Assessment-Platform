import { ChatPromptTemplate } from "@langchain/core/prompts";

import { llm } from "./llm.js";


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
- Include difficulty.

Return ONLY valid JSON.

Format:
[
  {
    "question": "...",
    "marks": 5,
    "expectedAnswer": "...",
    "topic": "...",
    "difficulty": "medium"
  }
]

Course material:
{context}`
    ],
    [
        "human",
        "{question}"
    ]
]);

export const questionChain = createExamPrompt.pipe(llm);