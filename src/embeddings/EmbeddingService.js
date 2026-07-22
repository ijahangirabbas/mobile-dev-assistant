/**
 * Abstract embedding interface.
 *
 * Every embedding provider must implement:
 *
 *   embed(text)           → number[]
 *
 *   embedBatch(texts[])   → number[][]
 *
 * The pipeline never knows which provider is active.
 * All providers return raw float vectors.
 */

export class EmbeddingService {
  /**
   * Embed a single text string.
   *
   * @param {string} text
   * @returns {Promise<number[]>}
   */
  async embed(text) {
    throw new Error(
      `${this.constructor.name} must implement embed(text)`
    );
  }

  /**
   * Embed multiple text strings in one call.
   *
   * @param {string[]} texts
   * @returns {Promise<number[][]>}
   */
  async embedBatch(texts) {
    throw new Error(
      `${this.constructor.name} must implement embedBatch(texts)`
    );
  }
}
