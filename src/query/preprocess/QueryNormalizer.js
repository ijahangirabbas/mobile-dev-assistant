/**
 * Normalizes a query for consistent downstream processing.
 *
 * Steps:
 * 1. Trim whitespace
 * 2. Collapse internal whitespace runs to single space
 * 3. Optionally lowercase (disabled by default — preserves proper nouns)
 *
 * Pure function.
 */

/**
 * @param {string}  query
 * @param {object}  [options]
 * @param {boolean} [options.lowercase]  default false
 * @returns {string}
 */
export function normalizeQuery(query, { lowercase = false } = {}) {
  let q = query.trim().replace(/\s+/g, " ");
  if (lowercase) q = q.toLowerCase();
  return q;
}
