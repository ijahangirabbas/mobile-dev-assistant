/**
 * Rewrites the query for better retrieval using the LLM.
 *
 * Strategy:
 *   - Converts conversational/vague queries into specific, keyword-rich queries
 *   - Example: "how do I go between screens?"
 *             → "React Native navigation between screens using React Navigation"
 *
 * Falls back to original query if:
 *   - LLM is not configured (no API key)
 *   - LLM call fails
 *   - Rewrite is empty or identical to input
 *
 * The rewritten query is only used for embedding — the user always
 * sees their original question in the response.
 */

const REWRITE_SYSTEM_PROMPT = `You are a search query optimizer for a React Native / mobile development course.
Rewrite the user's question into a concise, keyword-rich search query (1-2 sentences).
Focus on technical terms, concepts, and specific topics.
Return ONLY the rewritten query — no explanation, no quotes, no punctuation changes.`;

/**
 * @param {string} query
 * @param {import('../llm/LLMService.js').LLMService|null} llmService
 * @returns {Promise<string>}
 */
export async function rewriteQuery(query, llmService = null) {
  if (!llmService) return query;

  try {
    const rewritten = await llmService.complete([
      { role: "system", content: REWRITE_SYSTEM_PROMPT },
      { role: "user",   content: query },
    ], { maxTokens: 100, temperature: 0.0 });

    const trimmed = rewritten.trim();
    if (!trimmed || trimmed === query) return query;

    return trimmed;
  } catch {
    // Non-fatal — fall back silently
    return query;
  }
}
