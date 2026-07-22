/**
 * QueryService - PUBLIC ENTRY POINT for UI / API layer.
 *
 * Usage:
 *   const queryService = new QueryService();
 *   const result = await queryService.ask("How do I use React Navigation?");
 */

import { QueryPipeline } from "./QueryPipeline.js";
import { QdrantVectorStore } from "../vector/QdrantVectorStore.js";

export class QueryService {
  /**
   * @param {object} [options]
   * @param {QdrantVectorStore} [options.vectorStore]
   */
  constructor({ vectorStore } = {}) {
    const store = vectorStore || new QdrantVectorStore();
    this.pipeline = new QueryPipeline({ vectorStore: store });
  }

  /**
   * Ask a question against the indexed video course database.
   *
   * @param {string} question
   * @param {string} [userId="anonymous"]
   * @returns {Promise<object>} Formatted answer payload
   */
  async ask(question, userId = "anonymous") {
    return this.pipeline.execute(question, userId);
  }
}
