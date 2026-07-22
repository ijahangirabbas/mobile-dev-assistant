/**
 * RetryManager - Handles retry strategy when evaluation confidence is below threshold.
 */

import { config } from "../../config/config.js";

export class RetryManager {
  /**
   * @param {object} [options]
   * @param {number} [options.confidenceThreshold]
   * @param {number} [options.maxRetries]
   */
  constructor({
    confidenceThreshold = config.query.confidenceThreshold,
    maxRetries = config.query.maxRetries,
  } = {}) {
    this.confidenceThreshold = confidenceThreshold;
    this.maxRetries = maxRetries;
  }

  /**
   * Determines if the context should trigger a pipeline retry.
   *
   * @param {import('../QueryContext.js').QueryContext} ctx
   * @returns {boolean}
   */
  shouldRetry(ctx) {
    if (ctx.retryCount >= this.maxRetries) return false;
    return ctx.confidence < this.confidenceThreshold;
  }

  /**
   * Mutates context to prepare for retry iteration.
   *
   * @param {import('../QueryContext.js').QueryContext} ctx
   */
  prepareRetry(ctx) {
    ctx.retryCount++;
    ctx.topKMultiplier = 1.5 ** ctx.retryCount;
    console.log(`[RetryManager] 🔄 Retry #${ctx.retryCount} (confidence ${ctx.confidence} < ${this.confidenceThreshold}). Expanding K multiplier to ${ctx.topKMultiplier}`);
  }
}
