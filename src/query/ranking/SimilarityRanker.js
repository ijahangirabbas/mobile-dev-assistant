/**
 * SimilarityRanker - Default/fallback ranker using Qdrant's vector similarity score.
 * Fast, cheap, zero extra network calls.
 */

import { Ranker } from "./Ranker.js";

export class SimilarityRanker extends Ranker {
  /**
   * Sorts candidate results strictly by vector similarity score descending.
   *
   * @param {string} query
   * @param {import('../../models/SearchResult.js').SearchResult[]} results
   * @returns {Promise<import('../../models/SearchResult.js').SearchResult[]>}
   */
  async rank(query, results) {
    return [...results].sort((a, b) => b.score - a.score);
  }
}
