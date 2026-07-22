/**
 * Detects Personally Identifiable Information (PII) in the query.
 *
 * Detected types:
 * - Email addresses
 * - Phone numbers (international formats)
 * - Credit card numbers (basic pattern)
 * - Social Security Numbers (US)
 *
 * On detection: warns but does NOT block (returns passed=true with warning).
 * Upgrade to blocking if your use-case requires it.
 */

/** @typedef {import('./QueryValidationGuard.js').GuardResult} GuardResult */

const PII_PATTERNS = [
  { name: "email",       regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ },
  { name: "phone",       regex: /(\+?\d[\s\-.]?){7,15}\d/ },
  { name: "credit-card", regex: /\b(?:\d[ -]?){13,16}\b/ },
  { name: "ssn",         regex: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/ },
];

/**
 * @typedef {object} PiiResult
 * @property {boolean}  passed
 * @property {string[]} detected  names of detected PII types
 * @property {string}   [reason]
 */

/**
 * @param {string} query
 * @returns {PiiResult}
 */
export function checkPii(query) {
  const detected = PII_PATTERNS
    .filter(({ regex }) => regex.test(query))
    .map(({ name }) => name);

  if (detected.length > 0) {
    // Warn but allow through — log server-side in production
    console.warn(`[PiiGuard] ⚠ Possible PII detected: ${detected.join(", ")}`);
  }

  return { passed: true, detected };
}
