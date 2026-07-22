/**
 * Sliding-window in-memory rate limiter.
 *
 * Tracks request timestamps per key (e.g. user ID or IP).
 * Evicts timestamps older than the window on each check.
 *
 * Not suitable for distributed systems — use Redis there.
 * For single-process Node.js servers this is sufficient.
 */

import { config } from "../../config/config.js";

export class RateLimitGuard {
  /**
   * @param {object} [options]
   * @param {number} [options.requestsPerMinute]
   * @param {number} [options.windowMs]
   */
  constructor({
    requestsPerMinute = config.rateLimit.requestsPerMinute,
    windowMs = config.rateLimit.windowMs,
  } = {}) {
    this.limit = requestsPerMinute;
    this.windowMs = windowMs;
    /** @type {Map<string, number[]>} key → timestamp[] */
    this._store = new Map();
  }

  /**
   * Check whether the given key is within rate limit.
   *
   * @param {string} key   e.g. user ID or "anonymous"
   * @returns {{ passed: boolean; reason?: string; remaining: number }}
   */
  check(key = "anonymous") {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    // Get or create the timestamp list for this key
    let timestamps = this._store.get(key) ?? [];

    // Evict expired timestamps
    timestamps = timestamps.filter((t) => t > cutoff);

    if (timestamps.length >= this.limit) {
      const resetInMs = timestamps[0] + this.windowMs - now;
      return {
        passed: false,
        reason: `Rate limit exceeded. Try again in ${Math.ceil(resetInMs / 1000)}s.`,
        remaining: 0,
      };
    }

    // Record this request
    timestamps.push(now);
    this._store.set(key, timestamps);

    return {
      passed: true,
      remaining: this.limit - timestamps.length,
    };
  }

  /**
   * Reset all state (useful in tests).
   */
  reset() {
    this._store.clear();
  }
}
