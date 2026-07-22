/**
 * Creates Chunk objects.
 *
 * Responsibilities:
 *
 * - Accept a window of SubtitleEntry[] + lesson metadata
 * - Merge subtitle text into a single string
 * - Copy lesson metadata onto the chunk
 * - Calculate timing (startMs, endMs, durationMs)
 * - Build the timeline label ("00:02:00 - 00:02:15")
 * - Return a Chunk
 *
 * Keeps ChunkBuilder small by owning all Chunk construction details.
 */

import { Chunk } from "../models/Chunk.js";
import { formatTimeline } from "../utils/Time.js";
import { deterministicChunkId } from "../utils/IdGenerator.js";

export class ChunkFactory {
  /**
   * Build one Chunk from a 15-second window of subtitle entries.
   *
   * @param {object}  params
   * @param {import('../models/SubtitleEntry.js').SubtitleEntry[]} params.entries   entries in this window
   * @param {import('../models/FileInfo.js').NormalizedMeta}       params.meta      lesson normalized metadata
   * @returns {Chunk}
   */
  create({ entries, meta }) {
    const first = entries[0];
    const last = entries[entries.length - 1];

    const startMs = first.startMs;
    const endMs = last.endMs;
    const durationMs = endMs - startMs;

    const text = entries.map((e) => e.text).join(" ");
    const timeline = formatTimeline(startMs, endMs);
    const id = deterministicChunkId(meta.lessonSlug, startMs);

    return new Chunk({
      id,
      meta: {
        courseName: meta.courseName,
        moduleNumber: meta.moduleNumber,
        moduleFolderName: meta.moduleFolderName,
        lessonNumber: meta.lessonNumber,
        lessonTitle: meta.lessonTitle,
        lessonSlug: meta.lessonSlug,
      },
      text,
      timeline,
      timings: { startMs, endMs, durationMs },
      subtitleCount: entries.length,
    });
  }
}
