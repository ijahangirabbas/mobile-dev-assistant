/**
 * Generates IDs.
 *
 * Sequential IDs:
 *   chunk-0001
 *   lesson-0002
 *
 * Zero-padded to ID_PAD_WIDTH digits.
 *
 * Pure functions – no side effects.
 */

import { ID_PAD_WIDTH } from "../config/constants.js";

/**
 * Format a number as a zero-padded string.
 *
 * @param {number} n
 * @returns {string}
 */
function pad(n) {
  return String(n).padStart(ID_PAD_WIDTH, "0");
}

/**
 * Create a chunk ID.
 *
 * @param {number} index   0-based counter
 * @returns {string}       e.g. "chunk-0001"
 */
export function chunkId(index) {
  return `chunk-${pad(index + 1)}`;
}

/**
 * Create a lesson ID.
 *
 * @param {number} index   0-based counter
 * @returns {string}       e.g. "lesson-0001"
 */
export function lessonId(index) {
  return `lesson-${pad(index + 1)}`;
}

/**
 * Build a deterministic chunk ID from lesson slug + window start.
 *
 * Useful when the same file is re-indexed – IDs remain stable.
 *
 * Format:  "{lessonSlug}_{windowStartMs}"
 *
 * @param {string} lessonSlug
 * @param {number} windowStartMs
 * @returns {string}
 */
export function deterministicChunkId(lessonSlug, windowStartMs) {
  return `${lessonSlug}_${windowStartMs}`;
}
