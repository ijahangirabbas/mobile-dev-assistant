/**
 * Creates a query embedding using Jina's retrieval.query task.
 *
 * Separate from JinaEmbeddingService (which uses retrieval.passage) because:
 *
 *   - Passage task:  optimized for indexing — longer, detailed text
 *   - Query task:    optimized for retrieval — short questions
 *
 * Asymmetric embedding is a Jina v3 feature that significantly improves
 * retrieval quality over symmetric (same task for both sides).
 */

import { config } from "../../config/config.js";

const JINA_API_URL = "https://api.jina.ai/v1/embeddings";

export class QueryEmbeddingService {
  /**
   * @param {object} [options]
   * @param {string} [options.apiKey]
   * @param {string} [options.model]
   * @param {number} [options.dimensions]
   * @param {string} [options.task]
   */
  constructor({
    apiKey    = config.jina.apiKey,
    model     = config.jina.model,
    dimensions= config.jina.dimensions,
    task      = config.jina.queryTask,
  } = {}) {
    if (!apiKey) {
      throw new Error("JINA_API_KEY is required.");
    }
    this.apiKey     = apiKey;
    this.model      = model;
    this.dimensions = dimensions;
    this.task       = task;
  }

  /**
   * Embed a single query string.
   *
   * @param {string}   query
   * @param {string[]} [expandedTerms]  optional expansion terms appended before embedding
   * @returns {Promise<number[]>}
   */
  async embed(query, expandedTerms = []) {
    const input = expandedTerms.length > 0
      ? `${query} ${expandedTerms.join(" ")}`
      : query;

    const response = await fetch(JINA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        task: this.task,
        dimensions: this.dimensions,
        input: [input],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Jina query embedding error ${response.status}: ${err}`);
    }

    const json = await response.json();
    return json.data[0].embedding;
  }
}
