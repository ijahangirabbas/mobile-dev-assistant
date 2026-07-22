/**
 * Validates that the query meets basic structural requirements.
 *
 * Checks:
 * - Is a non-empty string
 * - Meets minimum character length
 * - Does not exceed maximum character length
 *
 * Returns a GuardResult (pass/fail + reason).
 */

const MIN_LENGTH = 3;
const MAX_LENGTH = 1_000;

/**
 * @typedef {object} GuardResult
 * @property {boolean} passed
 * @property {string}  [reason]  present when passed=false
 */

/**
 * @param {string} query
 * @returns {GuardResult}
 */
export function validateQuery(query) {
  if (typeof query !== "string") {
    return fail("Query must be a string.");
  }

  if (query.trim().length === 0) {
    return fail("Query cannot be empty.");
  }

  if (query.length < MIN_LENGTH) {
    return fail(`Query is too short (minimum ${MIN_LENGTH} characters).`);
  }

  if (query.length > MAX_LENGTH) {
    return fail(`Query is too long (maximum ${MAX_LENGTH} characters).`);
  }

  return { passed: true };
}

/** @param {string} reason @returns {GuardResult} */
function fail(reason) {
  return { passed: false, reason };
}
