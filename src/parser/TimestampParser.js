/**
 * Converts SRT timestamps to milliseconds and formatted strings.
 *
 * Input format:
 *   "00:01:25,500"   (HH:MM:SS,mmm)
 *   "00:01:25.500"   (HH:MM:SS.mmm – some tools use a dot)
 *
 * Outputs:
 *   ms      – 85500 (number)
 *   fmt     – "00:01:25" (HH:MM:SS, no sub-seconds)
 *
 * Pure utility – no side effects.
 */

import { SRT_TIMESTAMP_REGEX } from "../config/constants.js";

/**
 * @typedef {object} ParsedTimestamp
 * @property {number} ms   milliseconds
 * @property {string} fmt  "HH:MM:SS"
 */

/**
 * Parse an SRT timestamp string into ms and a formatted string.
 *
 * @param {string} raw   e.g. "00:01:25,500"
 * @returns {ParsedTimestamp}
 * @throws {Error} if the format is unrecognised
 */
export function parseTimestamp(raw) {
  const trimmed = raw.trim();
  const match = trimmed.match(SRT_TIMESTAMP_REGEX);

  if (!match) {
    throw new Error(`Invalid SRT timestamp: "${raw}"`);
  }

  const h = Number(match[1]);
  const m = Number(match[2]);
  const s = Number(match[3]);
  const ms = Number(match[4]);

  const totalMs = h * 3_600_000 + m * 60_000 + s * 1_000 + ms;

  const fmt = [
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].join(":");

  return { ms: totalMs, fmt };
}
