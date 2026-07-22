/**
 * Cleans subtitle text.
 *
 * Removes:
 * - HTML tags           <i>text</i>  →  text
 * - Extra whitespace    "  hello  "  →  "hello"
 * - Empty lines
 * - Windows line endings
 *
 * Keeps only readable, plain text.
 *
 * Pure utility – no side effects.
 */

import { HTML_TAG_REGEX, MULTI_SPACE_REGEX } from "../config/constants.js";

/**
 * Strip HTML tags from a subtitle cue text block.
 *
 * @param {string} raw
 * @returns {string}
 */
export function stripHtml(raw) {
  return raw.replace(HTML_TAG_REGEX, "");
}

/**
 * Collapse multiple consecutive whitespace characters into a single space.
 *
 * @param {string} text
 * @returns {string}
 */
export function collapseWhitespace(text) {
  return text.replace(MULTI_SPACE_REGEX, " ").trim();
}

/**
 * Normalise line endings to LF.
 *
 * @param {string} text
 * @returns {string}
 */
export function normalizeLF(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * Full cleaning pipeline for a single subtitle cue's text.
 *
 * 1. Normalise line endings
 * 2. Strip HTML tags
 * 3. Join lines with a single space
 * 4. Collapse whitespace
 *
 * @param {string} rawText
 * @returns {string}
 */
export function cleanSubtitleText(rawText) {
  const lf = normalizeLF(rawText);
  const noHtml = stripHtml(lf);
  const singleLine = noHtml.split("\n").join(" ");
  return collapseWhitespace(singleLine);
}
