/**
 * Qdrant implementation of VectorStore.
 *
 * Responsibilities:
 *
 * - Auto-create the collection if it doesn't exist
 * - Batch-upsert EmbeddedChunk[] as Qdrant points
 * - Map Chunk metadata into Qdrant payload
 * - Perform nearest-neighbour search
 * - Delete points by ID
 *
 * Each Qdrant point payload contains:
 *   id           – chunk.id
 *   text         – chunk.text
 *   timeline     – "00:02:00 - 00:02:15"
 *   courseName
 *   moduleNumber
 *   moduleFolderName
 *   lessonNumber
 *   lessonTitle
 *   lessonSlug
 *   startMs
 *   endMs
 *   durationMs
 *   subtitleCount
 */

import { QdrantClient } from "@qdrant/js-client-rest";
import { VectorStore } from "./VectorStore.js";
import { toBatches } from "../embeddings/EmbeddingBatcher.js";
import { config } from "../config/config.js";

export class QdrantVectorStore extends VectorStore {
  /**
   * @param {object} [options]
   * @param {string} [options.url]
   * @param {string} [options.collectionName]
   * @param {number} [options.vectorSize]
   * @param {string} [options.distance]
   * @param {number} [options.upsertBatchSize]
   */
  constructor({
    url = config.qdrant.url,
    apiKey = config.qdrant.apiKey,
    collectionName = config.qdrant.collectionName,
    vectorSize = config.qdrant.vectorSize,
    distance = config.qdrant.distance,
    upsertBatchSize = config.qdrant.upsertBatchSize,
  } = {}) {
    super();
    this.client = new QdrantClient({
      url,
      ...(apiKey ? { apiKey } : {}),
    });
    this.collectionName = collectionName;
    this.vectorSize = vectorSize;
    this.distance = distance;
    this.upsertBatchSize = upsertBatchSize;
  }

  /**
   * Create the Qdrant collection if it does not already exist.
   *
   * @returns {Promise<void>}
   */
  async ensureCollection() {
    const collections = await this.client.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === this.collectionName
    );

    if (exists) {
      console.log(`[Qdrant] Collection "${this.collectionName}" already exists.`);
      return;
    }

    await this.client.createCollection(this.collectionName, {
      vectors: {
        size: this.vectorSize,
        distance: this.distance,
      },
    });

    console.log(
      `[Qdrant] Created collection "${this.collectionName}" ` +
      `(size=${this.vectorSize}, distance=${this.distance})`
    );
  }

  /**
   * Upsert EmbeddedChunk[] into Qdrant in batches.
   *
   * @param {import('../models/EmbeddedChunk.js').EmbeddedChunk[]} embeddedChunks
   * @returns {Promise<void>}
   */
  async upsert(embeddedChunks) {
    const batches = toBatches(embeddedChunks, this.upsertBatchSize);

    for (const batch of batches) {
      const points = batch.map((ec) => this._toPoint(ec));

      await this.client.upsert(this.collectionName, {
        wait: true,
        points,
      });

      console.log(
        `[Qdrant] Upserted ${points.length} points → "${this.collectionName}"`
      );
    }
  }

  /**
   * Nearest-neighbour search.
   *
   * @param {number[]} vector
   * @param {number}   topK
   * @returns {Promise<import('./VectorStore.js').SearchResult[]>}
   */
  async search(vector, topK = 5) {
    const results = await this.client.search(this.collectionName, {
      vector,
      limit: topK,
      with_payload: true,
    });

    return results.map((r) => ({
      id: String(r.id),
      score: r.score,
      payload: r.payload,
    }));
  }

  /**
   * Delete points by their string IDs.
   *
   * @param {string[]} ids
   * @returns {Promise<void>}
   */
  async delete(ids) {
    await this.client.delete(this.collectionName, {
      wait: true,
      points: ids,
    });
  }

  /**
   * Convert an EmbeddedChunk into a Qdrant point object.
   *
   * Qdrant requires numeric or UUID point IDs. We store the chunk ID in the
   * payload and use a numeric hash for the Qdrant ID.
   *
   * @param {import('../models/EmbeddedChunk.js').EmbeddedChunk} ec
   * @returns {object}
   */
  _toPoint(ec) {
    const { chunk, embedding } = ec;
    const { meta, timings } = chunk;

    return {
      id: this._toNumericId(chunk.id),
      vector: embedding,
      payload: {
        chunkId: chunk.id,
        text: chunk.text,
        timeline: chunk.timeline,
        subtitleCount: chunk.subtitleCount,
        // Lesson metadata
        courseName: meta.courseName,
        moduleNumber: meta.moduleNumber,
        moduleFolderName: meta.moduleFolderName,
        lessonNumber: meta.lessonNumber,
        lessonTitle: meta.lessonTitle,
        lessonSlug: meta.lessonSlug,
        // Timings
        startMs: timings.startMs,
        endMs: timings.endMs,
        durationMs: timings.durationMs,
      },
    };
  }

  /**
   * Convert a string chunk ID into a stable unsigned 32-bit integer
   * suitable for Qdrant's numeric point IDs.
   *
   * Uses a simple djb2-style hash.
   *
   * @param {string} id
   * @returns {number}
   */
  _toNumericId(id) {
    let hash = 5381;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) + hash) ^ id.charCodeAt(i);
      hash = hash >>> 0; // keep as unsigned 32-bit
    }
    return hash;
  }
}
