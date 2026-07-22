/**
 * Chunk with vector.
 *
 * Contains:
 *
 * chunk      – the original Chunk object
 *
 * embedding  – float32[] produced by the embedding model
 *
 * Nothing else.
 */

export class EmbeddedChunk {
  /**
   * @param {object} params
   * @param {import('./Chunk.js').Chunk} params.chunk
   * @param {number[]}                  params.embedding
   */
  constructor({ chunk, embedding }) {
    /** @type {import('./Chunk.js').Chunk} */
    this.chunk = chunk;

    /** @type {number[]} */
    this.embedding = embedding;

    Object.freeze(this);
  }
}
