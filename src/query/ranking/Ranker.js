/**
 * Abstract Ranker interface.
 *
 * Every ranker implementation must accept:
 *   - query string
 *   - SearchResult[] candidates
 *
 * And return:
 *   - SearchResult[] ranked and sorted by relevance
 */

export class Ranker {
  /**
   * @param {string} query
   * @param {import('../../models/SearchResult.js').SearchResult[]} results
   * @returns {Promise<import('../../models/SearchResult.js').SearchResult[]>}
   */
  async rank(query, results) {
    throw new Error(`${this.constructor.name} must implement rank(query, results)`);
  }
}
