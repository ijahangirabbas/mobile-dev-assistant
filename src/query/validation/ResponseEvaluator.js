/**
 * ResponseEvaluator - Integrates all guards and computes final confidence evaluation report.
 */

import { GroundingGuard } from "./GroundingGuard.js";
import { CitationGuard } from "./CitationGuard.js";
import { HallucinationGuard } from "./HallucinationGuard.js";
import { ConfidenceScorer } from "./ConfidenceScorer.js";

export class ResponseEvaluator {
  constructor() {
    this.groundingGuard = new GroundingGuard();
    this.citationGuard = new CitationGuard();
    this.hallucinationGuard = new HallucinationGuard();
    this.scorer = new ConfidenceScorer();
  }

  /**
   * Evaluates generated answer against context and sources.
   *
   * @param {string} answer
   * @param {string} context
   * @param {import('../retrieval/ContextBuilder.js').ContextSource[]} sources
   * @param {import('../../models/SearchResult.js').SearchResult[]} rankedResults
   * @returns {{ confidence: number; grounding: object; citation: object; hallucination: object }}
   */
  evaluate(answer, context, sources, rankedResults) {
    const avgRetrievalScore =
      rankedResults.length > 0
        ? rankedResults.reduce((acc, r) => acc + r.score, 0) / rankedResults.length
        : 0;

    const grounding = this.groundingGuard.check(answer, context);
    const citation = this.citationGuard.check(answer, sources);
    const hallucination = this.hallucinationGuard.check(answer);

    const confidence = this.scorer.score({
      retrievalScore: avgRetrievalScore,
      groundedScore: grounding.groundedScore,
      citationScore: citation.citationScore,
      hallucinationRisk: hallucination.hallucinationRisk,
    });

    return {
      confidence,
      grounding,
      citation,
      hallucination,
    };
  }
}
