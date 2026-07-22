/**
 * ConfidenceScorer - Aggregates scores from retrieval, grounding, citation, and hallucination checks.
 */

export class ConfidenceScorer {
  /**
   * Calculates overall confidence score (0-100).
   *
   * @param {object} params
   * @param {number} params.retrievalScore  Average score of top chunks
   * @param {number} params.groundedScore   0-1
   * @param {number} params.citationScore   0-1
   * @param {number} params.hallucinationRisk 0-1
   * @returns {number} 0 to 100
   */
  score({ retrievalScore, groundedScore, citationScore, hallucinationRisk }) {
    const normRetrieval = Math.min(1.0, retrievalScore || 0);
    const antiHallucination = 1.0 - (hallucinationRisk || 0);

    const weighted =
      normRetrieval * 0.35 +
      groundedScore * 0.35 +
      citationScore * 0.15 +
      antiHallucination * 0.15;

    return Math.round(weighted * 100);
  }
}
