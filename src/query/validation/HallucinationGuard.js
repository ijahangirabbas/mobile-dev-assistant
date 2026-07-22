/**
 * HallucinationGuard - Detects ungrounded or speculative phrasing in the LLM answer.
 */

const HALLUCINATION_INDICATORS = [
  "as an ai language model",
  "i do not have access",
  "in general knowledge",
  "outside the course",
  "i assume that",
  "typically in software development",
];

export class HallucinationGuard {
  /**
   * @param {string} answer
   * @returns {{ hallucinationRisk: number; passes: boolean }}
   */
  check(answer) {
    const lower = answer.toLowerCase();
    let riskCount = 0;

    for (const phrase of HALLUCINATION_INDICATORS) {
      if (lower.includes(phrase)) {
        riskCount++;
      }
    }

    const risk = Math.min(1.0, riskCount * 0.4);
    return {
      hallucinationRisk: risk,
      passes: risk < 0.5,
    };
  }
}
