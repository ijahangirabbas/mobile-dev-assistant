/**
 * Abstract vector storage interface.
 *
 * Every vector database implementation must provide:
 *
 *   ensureCollection()              – create collection if missing
 *
 *   upsert(embeddedChunks)         – insert or update points
 *
 *   search(vector, topK)           – nearest-neighbour search
 *
 *   delete(ids)                    – remove points by ID
 *
 * The IndexingPipeline only depends on this interface.
 * Switching from Qdrant to Pinecone means changing only the
 * concrete implementation.
 */

export class VectorStore {
  /**
   * Ensure the collection exists. Create it if it doesn't.
   *
   * @returns {Promise<void>}
   */
  async ensureCollection() {
    throw new Error(
      `${this.constructor.name} must implement ensureCollection()`
    );
  }

  /**
   * Upsert embedded chunks into the store.
   *
   * @param {import('../models/EmbeddedChunk.js').EmbeddedChunk[]} embeddedChunks
   * @returns {Promise<void>}
   */
  async upsert(embeddedChunks) {
    throw new Error(
      `${this.constructor.name} must implement upsert(embeddedChunks)`
    );
  }

  /**
   * Nearest-neighbour vector search.
   *
   * @param {number[]} vector   query embedding
   * @param {number}   topK     number of results to return
   * @returns {Promise<SearchResult[]>}
   */
  async search(vector, topK = 5) {
    throw new Error(
      `${this.constructor.name} must implement search(vector, topK)`
    );
  }

  /**
   * Delete points by their IDs.
   *
   * @param {string[]} ids
   * @returns {Promise<void>}
   */
  async delete(ids) {
    throw new Error(
      `${this.constructor.name} must implement delete(ids)`
    );
  }
}

/**
 * @typedef {object} SearchResult
 * @property {string}  id
 * @property {number}  score
 * @property {object}  payload
 */
