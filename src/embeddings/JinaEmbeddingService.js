/**
 * Jina Embeddings v3 implementation.
 *
 * Responsibilities:
 *
 * - Call the Jina Embeddings REST API
 * - Send texts in batches (via EmbeddingBatcher)
 * - Receive float vectors
 * - Return EmbeddedChunk[]
 *
 * No vector database logic lives here.
 *
 * API reference: https://jina.ai/embeddings/
 */

import { EmbeddingService } from "./EmbeddingService.js";
import { EmbeddedChunk } from "../models/EmbeddedChunk.js";
import { toIndexedBatches } from "./EmbeddingBatcher.js";
import { config } from "../config/config.js";

const JINA_API_URL = "https://api.jina.ai/v1/embeddings";

export class JinaEmbeddingService extends EmbeddingService {
  /**
   * @param {object} [options]
   * @param {string} [options.apiKey]
   * @param {string} [options.model]
   * @param {number} [options.dimensions]
   * @param {string} [options.task]
   * @param {number} [options.batchSize]
   */
  constructor({
    apiKey = config.jina.apiKey,
    model = config.jina.model,
    dimensions = config.jina.dimensions,
    task = config.jina.task,
    batchSize = config.embedding.batchSize,
  } = {}) {
    super();

    if (!apiKey) {
      throw new Error("JINA_API_KEY is required. Set it in your .env file.");
    }

    this.apiKey = apiKey;
    this.model = model;
    this.dimensions = dimensions;
    this.task = task;
    this.batchSize = batchSize;
  }

  /**
   * Embed a single text.
   *
   * @param {string} text
   * @returns {Promise<number[]>}
   */
  async embed(text) {
    const [vector] = await this.embedBatch([text]);
    return vector;
  }

  /**
   * Embed multiple texts, automatically splitting into batches.
   *
   * @param {string[]} texts
   * @returns {Promise<number[][]>}
   */
  async embedBatch(texts) {
    const batches = toIndexedBatches(texts, this.batchSize);
    const allVectors = new Array(texts.length);

    for (const batch of batches) {
      const vectors = await this._callApi(batch.texts);
      vectors.forEach((vec, i) => {
        allVectors[batch.startIndex + i] = vec;
      });
    }

    return allVectors;
  }

  /**
   * Embed a list of Chunk objects and return EmbeddedChunk[].
   *
   * @param {import('../models/Chunk.js').Chunk[]} chunks
   * @returns {Promise<import('../models/EmbeddedChunk.js').EmbeddedChunk[]>}
   */
  async embedChunks(chunks) {
    const texts = chunks.map((c) => c.text);
    const vectors = await this.embedBatch(texts);

    return chunks.map(
      (chunk, i) => new EmbeddedChunk({ chunk, embedding: vectors[i] })
    );
  }

  /**
   * Make one POST request to the Jina API.
   *
   * @param {string[]} texts
   * @returns {Promise<number[][]>}
   */
  async _callApi(texts) {
    const body = JSON.stringify({
      model: this.model,
      task: this.task,
      dimensions: this.dimensions,
      input: texts,
    });

    const response = await fetch(JINA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Jina API error ${response.status}: ${errorText}`
      );
    }

    /** @type {{ data: { index: number; embedding: number[] }[] }} */
    const json = await response.json();

    // Sort by index to guarantee order matches input
    const sorted = json.data.slice().sort((a, b) => a.index - b.index);
    return sorted.map((d) => d.embedding);
  }
}
