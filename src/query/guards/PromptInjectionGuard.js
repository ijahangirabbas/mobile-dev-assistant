/**
 * Detects common prompt injection patterns.
 *
 * Looks for attempts to override system instructions,
 * jailbreak the model, or exfiltrate context.
 *
 * Pure function – rule-based, no ML.
 */

/** @typedef {import('./QueryValidationGuard.js').GuardResult} GuardResult */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /forget\s+(everything|all|your|previous)/i,
  /you\s+are\s+now\s+(a|an|the)\s+/i,
  /act\s+as\s+(if\s+)?(you\s+are|a|an)\s+/i,
  /disregard\s+(your|all|any)\s+(previous|instructions|rules)/i,
  /system\s*:\s*(you|ignore|forget)/i,
  /<\s*system\s*>/i,
  /\[\s*system\s*\]/i,
  /jailbreak/i,
  /dan\s+mode/i,
  /do\s+anything\s+now/i,
  /reveal\s+(your\s+)?(system\s+prompt|instructions|context)/i,
  /print\s+(your\s+)?(system\s+prompt|instructions)/i,
];

/**
 * @param {string} query
 * @returns {GuardResult}
 */
export function checkPromptInjection(query) {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(query)) {
      return {
        passed: false,
        reason: "Query contains disallowed content.",
      };
    }
  }
  return { passed: true };
}
