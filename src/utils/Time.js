/**
 * Time helpers.
 *
 * Converts between:
 *
 * milliseconds  ↔  seconds  ↔  HH:MM:SS
 *
 * Formatting for display ("00:02:00")
 *
 * Pure functions – no side effects.
 */

/**
 * Convert milliseconds → whole seconds (floored).
 *
 * @param {number} ms
 * @returns {number}
 */
export function msToSeconds(ms) {
  return Math.floor(ms / 1000);
}

/**
 * Convert whole seconds → milliseconds.
 *
 * @param {number} seconds
 * @returns {number}
 */
export function secondsToMs(seconds) {
  return seconds * 1000;
}

/**
 * Format milliseconds as  HH:MM:SS  (no sub-seconds).
 *
 * Examples:
 *   0        → "00:00:00"
 *   85500    → "00:01:25"
 *   3725000  → "01:02:05"
 *
 * @param {number} ms
 * @returns {string}
 */
export function formatMs(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

/**
 * Format a time range as  "HH:MM:SS - HH:MM:SS".
 *
 * Example:
 *   120000, 135000  →  "00:02:00 - 00:02:15"
 *
 * @param {number} startMs
 * @param {number} endMs
 * @returns {string}
 */
export function formatTimeline(startMs, endMs) {
  return `${formatMs(startMs)} - ${formatMs(endMs)}`;
}

/**
 * Round a millisecond value down to the nearest window boundary.
 *
 * Example (15-second window):
 *   13000  →  0        (window 0–15s)
 *   15000  →  15000    (window 15–30s)
 *   29999  →  15000    (window 15–30s)
 *
 * @param {number} ms            timestamp in milliseconds
 * @param {number} windowSeconds window size in seconds
 * @returns {number}             window start in milliseconds
 */
export function floorToWindow(ms, windowSeconds) {
  const windowMs = secondsToMs(windowSeconds);
  return Math.floor(ms / windowMs) * windowMs;
}
