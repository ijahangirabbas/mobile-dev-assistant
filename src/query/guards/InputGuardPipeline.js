/**
 * Runs all input guards in sequence.
 *
 * Guard order:
 *   1. QuerySanitizer    – clean raw input
 *   2. QueryValidation   – structural requirements
 *   3. PromptInjection   – injection patterns
 *   4. PiiGuard          – PII detection (warn only)
 *   5. RateLimitGuard    – per-user throttle
 *
 * Fails fast — stops on first blocking failure.
 * Returns sanitized query if all guards pass.
 */

import { sanitizeQuery }         from "./QuerySanitizer.js";
import { validateQuery }         from "./QueryValidationGuard.js";
import { checkPromptInjection }  from "./PromptInjectionGuard.js";
import { checkPii }              from "./PiiGuard.js";
import { RateLimitGuard }        from "./RateLimitGuard.js";

export class InputGuardPipeline {
  /**
   * @param {object} [options]
   * @param {RateLimitGuard} [options.rateLimitGuard]  inject for testing
   */
  constructor({ rateLimitGuard } = {}) {
    this.rateLimiter = rateLimitGuard ?? new RateLimitGuard();
  }

  /**
   * Run all guards against a raw query.
   *
   * @param {string} rawQuery
   * @param {string} [userId]    key for rate limiting
   * @returns {{ passed: boolean; sanitized?: string; reason?: string }}
   */
  run(rawQuery, userId = "anonymous") {
    // 1. Sanitize
    const sanitized = sanitizeQuery(rawQuery);

    // 2. Structural validation
    const validation = validateQuery(sanitized);
    if (!validation.passed) {
      return { passed: false, reason: validation.reason };
    }

    // 3. Prompt injection
    const injection = checkPromptInjection(sanitized);
    if (!injection.passed) {
      return { passed: false, reason: injection.reason };
    }

    // 4. PII (warn-only — does not block)
    checkPii(sanitized);

    // 5. Rate limit
    const rateLimit = this.rateLimiter.check(userId);
    if (!rateLimit.passed) {
      return { passed: false, reason: rateLimit.reason };
    }

    return { passed: true, sanitized };
  }
}
