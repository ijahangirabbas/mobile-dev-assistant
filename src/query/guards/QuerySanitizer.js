/**
 * Cleans raw query string before any validation or processing.
 *
 * Removes:
 * - Null bytes
 * - Non-printable control characters
 * - Leading / trailing whitespace
 * - Excessive internal whitespace
 *
 * Pure function – no side effects.
 */

/**
 * @param {string} raw
 * @returns {string}
 */
export function sanitizeQuery(raw) {
  return raw
    .replace(/\0/g, "")                      // null bytes
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // non-printable control chars (keep \t \n \r)
    .replace(/[ \t]+/g, " ")                 // collapse horizontal whitespace
    .replace(/\n{3,}/g, "\n\n")              // max 2 consecutive newlines
    .trim();
}
