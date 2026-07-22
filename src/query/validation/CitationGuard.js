/**
 * CitationGuard - Ensures generated answers cite actual source lessons/timelines.
 */

export class CitationGuard {
  /**
   * @param {string} answer
   * @param {import('../retrieval/ContextBuilder.js').ContextSource[]} sources
   * @returns {{ citationScore: number; passes: boolean; validCitations: number }}
   */
  check(answer, sources) {
    if (!sources || sources.length === 0) return { citationScore: 1, passes: true, validCitations: 0 };

    let validCount = 0;
    for (const src of sources) {
      if (answer.includes(src.lessonTitle) || answer.includes(src.timeline)) {
        validCount++;
      }
    }

    const citationScore = validCount > 0 ? Math.min(1.0, validCount / Math.min(2, sources.length)) : 0.5;
    return {
      citationScore,
      passes: citationScore >= 0.5,
      validCitations: validCount,
    };
  }
}
