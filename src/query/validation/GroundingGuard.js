/**
 * GroundingGuard - Checks whether key statements in the LLM answer match the retrieved context.
 */

export class GroundingGuard {
  /**
   * @param {string} answer
   * @param {string} context
   * @returns {{ groundedScore: number; passes: boolean }}
   */
  check(answer, context) {
    if (!answer || !context) return { groundedScore: 0, passes: false };

    // Extract significant terms from answer
    const answerWords = answer.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    if (answerWords.length === 0) return { groundedScore: 1, passes: true };

    const contextLower = context.toLowerCase();
    let matched = 0;

    for (const word of answerWords) {
      if (contextLower.includes(word)) {
        matched++;
      }
    }

    const groundedScore = matched / answerWords.length;
    return {
      groundedScore,
      passes: groundedScore >= 0.4,
    };
  }
}
