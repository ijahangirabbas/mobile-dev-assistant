/**
 * Builds chunks from subtitle entries using a fixed-time sliding window.
 *
 * Strategy:
 *
 *   - Iterate subtitle entries sequentially
 *   - Group entries whose startMs falls within the same 15-second window
 *   - Window boundaries are aligned to absolute time (0-15s, 15-30s, 30-45s …)
 *   - Flush each window into a Chunk via ChunkFactory
 *   - Skip empty windows
 *   - Return Chunk[]
 *
 * Does NOT:
 * - Embed
 * - Store vectors
 */

import { config } from "../config/config.js";
import { floorToWindow, secondsToMs } from "../utils/Time.js";
import { ChunkFactory } from "./ChunkFactory.js";

export class ChunkBuilder {
  /**
   * @param {object} [options]
   * @param {number} [options.windowSeconds]  window size in seconds (default from config)
   */
  constructor({ windowSeconds = config.chunking.windowSeconds } = {}) {
    this.windowSeconds = windowSeconds;
    this.windowMs = secondsToMs(windowSeconds);
    this.factory = new ChunkFactory();
  }

  /**
   * Group subtitle entries into fixed-time Chunk windows.
   *
   * @param {import('../models/Lesson.js').Lesson} lesson
   * @returns {import('../models/Chunk.js').Chunk[]}
   */
  build(lesson) {
    const { entries } = lesson;
    const meta = lesson.fileInfo.normalized;

    if (entries.length === 0) return [];

    /** Map<windowStartMs, SubtitleEntry[]> */
    const windows = new Map();

    for (const entry of entries) {
      const windowStart = floorToWindow(entry.startMs, this.windowSeconds);

      if (!windows.has(windowStart)) {
        windows.set(windowStart, []);
      }

      windows.get(windowStart).push(entry);
    }

    // Sort windows by start time then build Chunk for each
    const sortedKeys = [...windows.keys()].sort((a, b) => a - b);

    return sortedKeys.map((windowStart) => {
      const windowEntries = windows.get(windowStart);
      return this.factory.create({ entries: windowEntries, meta });
    });
  }
}
