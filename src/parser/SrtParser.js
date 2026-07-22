/**
 * Reads an SRT file and converts it into a structured Lesson.
 *
 * Responsibilities:
 * - Read the file from disk
 * - Split raw content into subtitle blocks
 * - Delegate timestamp parsing to TimestampParser
 * - Delegate text cleaning to SubtitleCleaner
 * - Create SubtitleEntry objects
 * - Assemble and return a Lesson
 *
 * Does NOT:
 * - Chunk
 * - Embed
 * - Access the vector database
 */

import { readText } from "../utils/FileSystem.js";
import { SRT_TIMESTAMP_LINE_REGEX } from "../config/constants.js";
import { parseTimestamp } from "./TimestampParser.js";
import { cleanSubtitleText } from "./SubtitleCleaner.js";
import { SubtitleEntry } from "../models/SubtitleEntry.js";
import { Lesson } from "../models/Lesson.js";

export class SrtParser {
  /**
   * Parse a single SRT file and return a Lesson.
   *
   * @param {import('../models/FileInfo.js').FileInfo} fileInfo
   * @returns {Promise<Lesson>}
   */
  async parse(fileInfo) {
    const raw = await readText(fileInfo.raw.absolutePath);
    const entries = this._parseEntries(raw);
    return new Lesson({ fileInfo, entries });
  }

  /**
   * Split raw SRT content into SubtitleEntry[].
   *
   * SRT blocks are separated by one or more blank lines:
   *
   *   1
   *   00:00:01,000 --> 00:00:04,000
   *   Hello world
   *
   *   2
   *   00:00:05,000 --> 00:00:08,000
   *   Second line
   *
   * @param {string} rawContent
   * @returns {SubtitleEntry[]}
   */
  _parseEntries(rawContent) {
    // Normalise line endings then split into blocks
    const normalised = rawContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const blocks = normalised.split(/\n{2,}/);

    /** @type {SubtitleEntry[]} */
    const entries = [];

    for (const block of blocks) {
      const lines = block.trim().split("\n");
      if (lines.length < 2) continue;

      // First line: cue index (may be absent in broken SRTs – skip gracefully)
      const cueId = Number(lines[0]);
      if (!Number.isFinite(cueId)) continue;

      // Second line: timestamps
      const timestampLine = lines[1];
      const tsMatch = timestampLine.match(SRT_TIMESTAMP_LINE_REGEX);
      if (!tsMatch) continue;

      let start, end;
      try {
        start = parseTimestamp(tsMatch[1]);
        end = parseTimestamp(tsMatch[2]);
      } catch {
        // Malformed timestamp – skip this block
        continue;
      }

      // Remaining lines: cue text
      const rawText = lines.slice(2).join("\n");
      const text = cleanSubtitleText(rawText);
      if (!text) continue; // skip empty / whitespace-only cues

      entries.push(
        new SubtitleEntry({
          id: cueId,
          startMs: start.ms,
          endMs: end.ms,
          startFmt: start.fmt,
          endFmt: end.fmt,
          text,
        })
      );
    }

    return entries;
  }
}
