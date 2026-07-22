/**
 * CrossEncoderRanker - Reranks candidate chunks using Jina Reranker API.
 * Slower and highly accurate, computing true query-document cross-attention scores.
 */

import { Ranker } from "./Ranker.js";
import { config } from "../../config/config.js";

const JINA_RERANK_URL = "https://api.jina.ai/v1/rerank";

export class CrossEncoderRanker extends Ranker {
  /**
   * @param {object} [options]
   * @param {string} [options.apiKey]
   * @param {string} [options.model]
   */
  constructor({
    apiKey = config.jina.apiKey,
    model = config.jina.rerankerModel,
  } = {}) {
    super();
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Reranks candidate SearchResult[] against the query string.
   *
   * @param {string} query
   * @param {import('../../models/SearchResult.js').SearchResult[]} results
   * @returns {Promise<import('../../models/SearchResult.js').SearchResult[]>}
   */
  async rank(query, results) {
    if (!results || results.length === 0) return [];
    if (!this.apiKey) {
      console.warn("[CrossEncoderRanker] JINA_API_KEY missing, falling back to similarity score.");
      return results;
    }

    try {
      const documents = results.map((r) => r.text);
      const response = await fetch(JINA_RERANK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          query,
          documents,
          top_n: results.length,
        }),
      });

      if (!response.ok) {
        console.warn(`[CrossEncoderRanker] Jina Rerank API returned ${response.status}. Using fallback.`);
        return results;
      }

      const json = await response.json();
      const rerankedData = json.results || json.data || [];

      // Map back to SearchResult instances with updated scores
      const reranked = rerankedData.map((item) => {
        const original = results[item.index];
        return new original.constructor({
          id: original.id,
          score: item.relevance_score,
          text: original.text,
          timeline: original.timeline,
          meta: original.meta,
        });
      });

      return reranked;
    } catch (err) {
      console.warn("[CrossEncoderRanker] Rerank error:", err.message);
      return results;
    }
  }
}
