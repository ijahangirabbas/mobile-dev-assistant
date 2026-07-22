/**
 * Formats the user prompt combining retrieved context and original question.
 */

export function buildUserPrompt(question, context) {
  return `COURSE TRANSCRIPT CONTEXT:
---
${context || "No context found."}
---

USER QUESTION:
${question}

Please answer the question based on the course transcript context above, citing timestamps where appropriate.`;
}
