/**
 * Retrieves candidate chunks from Qdrant.
 *
 * Responsibilities:
 * - Accept query vector
 * - Call VectorStore.search() with a large topK (50 by default)
 * - Map raw results to SearchResult[]
 * - Return candidates
 *
 * Does NOT rank or filter. Retrieves broadly — ranking happens later.
 * Retrieve Top 50, not Top 5.
 */

import { config }              from "../../config/config.js";
import { mapSearchResults }    from "./SearchResultMapper.js";

export class Retriever {
  /**
   * @param {import('../../vector/QdrantVectorStore.js').QdrantVectorStore} vectorStore
   * @param {object} [options]
   * @param {number} [options.topK]
   */
  constructor(vectorStore, { topK = config.query.topKInitial } = {}) {
    this.vectorStore = vectorStore;
    this.topK = topK;
  }

  /**
   * @param {number[]} queryVector
   * @param {number}   [topKOverride]  used during retry with larger K
   * @returns {Promise<import('../../models/SearchResult.js').SearchResult[]>}
   */
  async retrieve(queryVector, topKOverride) {
    const k = topKOverride ?? this.topK;
    const rawResults = await this.vectorStore.search(queryVector, k);
    return mapSearchResults(rawResults);
  }
}
