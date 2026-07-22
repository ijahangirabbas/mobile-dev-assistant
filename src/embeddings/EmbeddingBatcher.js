/**
 * Splits large chunk collections into batches for API calls.
 *
 * Example:
 *
 *   120 chunks  →  [32, 32, 32, 24]  (batches of ≤32)
 *
 * Prevents exceeding Jina API limits.
 *
 * Pure utility – no side effects.
 */

/**
 * Split an array into consecutive batches of at most `batchSize` items.
 *
 * @template T
 * @param {T[]}    items
 * @param {number} batchSize
 * @returns {T[][]}
 */
export function toBatches(items, batchSize) {
  if (batchSize <= 0) throw new RangeError("batchSize must be > 0");

  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Split an array of texts into batches, preserving the original index mapping.
 *
 * Returns objects so callers can track which batch came from where:
 *
 * @param {string[]} texts
 * @param {number}   batchSize
 * @returns {{ startIndex: number; texts: string[] }[]}
 */
export function toIndexedBatches(texts, batchSize) {
  const batches = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    batches.push({
      startIndex: i,
      texts: texts.slice(i, i + batchSize),
    });
  }
  return batches;
}
