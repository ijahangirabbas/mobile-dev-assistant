/**
 * DiversityRanker - Prevents top results from being repetitive or coming from the exact same lesson timeline.
 * Ensures a wide representation of relevant content across the course.
 */

import { Ranker } from "./Ranker.js";

export class DiversityRanker extends Ranker {
  /**
   * @param {object} [options]
   * @param {number} [options.maxPerLesson]  Max allowed chunks from the same lesson slug in top results
   */
  constructor({ maxPerLesson = 2 } = {}) {
    super();
    this.maxPerLesson = maxPerLesson;
  }

  /**
   * @param {string} query
   * @param {import('../../models/SearchResult.js').SearchResult[]} results
   * @returns {Promise<import('../../models/SearchResult.js').SearchResult[]>}
   */
  async rank(query, results) {
    const lessonCounts = new Map();
    const diverse = [];
    const overflow = [];

    for (const item of results) {
      const slug = item.meta.lessonSlug || "default";
      const current = lessonCounts.get(slug) || 0;

      if (current < this.maxPerLesson) {
        lessonCounts.set(slug, current + 1);
        diverse.push(item);
      } else {
        overflow.push(item);
      }
    }

    // Append overflow at the end if needed to maintain full length
    return [...diverse, ...overflow];
  }
}
