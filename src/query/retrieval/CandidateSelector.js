/**
 * Reduces retrieved candidates before reranking.
 *
 * Steps:
 *   1. Remove exact duplicates (same chunk ID)
 *   2. Remove near-duplicates (text Jaccard similarity above threshold)
 *   3. Cap at topK (default 20)
 *
 * Runs after Retriever, before Ranker.
 * Ensures the reranker works on diverse, non-redundant candidates.
 */

import { config } from "../../config/config.js";

const NEAR_DUPLICATE_THRESHOLD = 0.85; // Jaccard similarity

export class CandidateSelector {
  /**
   * @param {object} [options]
   * @param {number} [options.topK]
   * @param {number} [options.similarityThreshold]
   */
  constructor({
    topK = config.query.topKSelect,
    similarityThreshold = NEAR_DUPLICATE_THRESHOLD,
  } = {}) {
    this.topK = topK;
    this.similarityThreshold = similarityThreshold;
  }

  /**
   * @param {import('../../models/SearchResult.js').SearchResult[]} candidates
   * @returns {import('../../models/SearchResult.js').SearchResult[]}
   */
  select(candidates) {
    // 1. Deduplicate by chunk ID (keep highest score)
    const byId = new Map();
    for (const c of candidates) {
      const existing = byId.get(c.id);
      if (!existing || c.score > existing.score) {
        byId.set(c.id, c);
      }
    }

    const unique = [...byId.values()].sort((a, b) => b.score - a.score);

    // 2. Remove near-duplicates using token Jaccard similarity
    const selected = [];
    for (const candidate of unique) {
      if (selected.length >= this.topK) break;

      const isDuplicate = selected.some(
        (s) => this._jaccard(s.text, candidate.text) >= this.similarityThreshold
      );

      if (!isDuplicate) {
        selected.push(candidate);
      }
    }

    return selected;
  }

  /**
   * Jaccard similarity between two strings (token-level).
   *
   * @param {string} a
   * @param {string} b
   * @returns {number} 0–1
   */
  _jaccard(a, b) {
    const setA = new Set(a.toLowerCase().split(/\s+/));
    const setB = new Set(b.toLowerCase().split(/\s+/));
    const intersection = [...setA].filter((t) => setB.has(t)).length;
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : intersection / union;
  }
}
