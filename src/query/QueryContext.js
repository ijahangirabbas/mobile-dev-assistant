/**
 * QueryContext — mutable state bag that flows through the query pipeline.
 *
 * Every stage reads from it and writes its output back into it.
 * This avoids long parameter lists and makes the pipeline easy to debug:
 * inspect context at any stage to see exactly what happened.
 *
 * It is intentionally mutable — it accumulates results over the pipeline run.
 */

export class QueryContext {
  /**
   * @param {string} rawQuery  the original user question
   */
  constructor(rawQuery) {
    // ── Input ──────────────────────────────────────────────────────────────
    /** Original unmodified question */
    this.rawQuery = rawQuery;
    /** After sanitization */
    this.sanitizedQuery = rawQuery;
    /** After normalization */
    this.normalizedQuery = rawQuery;
    /** After LLM rewrite (may be same as normalized) */
    this.rewrittenQuery = rawQuery;
    /** Detected intent: "question" | "command" | "conversational" | "unknown" */
    this.intent = "question";
    /** Additional terms added by QueryExpander */
    this.expandedTerms = [];

    // ── Retrieval ──────────────────────────────────────────────────────────
    /** Float[] query embedding */
    this.queryVector = null;
    /** Raw results from Qdrant (top 50) */
    this.candidates = [];
    /** After deduplication (top 20) */
    this.selectedCandidates = [];
    /** After reranking (top 5) */
    this.rankedResults = [];

    // ── Generation ─────────────────────────────────────────────────────────
    /** Merged context string passed to LLM */
    this.context = "";
    /** { system: string, user: string } */
    this.prompt = { system: "", user: "" };
    /** Raw LLM response text */
    this.rawAnswer = "";

    // ── Validation ─────────────────────────────────────────────────────────
    /** Evaluation report from ResponseEvaluator */
    this.evaluation = null;
    /** Final confidence score 0–100 */
    this.confidence = 0;

    // ── Output ─────────────────────────────────────────────────────────────
    /** Final answer (may differ from rawAnswer after post-processing) */
    this.finalAnswer = "";
    /** Source citations */
    this.sources = [];

    // ── Control flow ───────────────────────────────────────────────────────
    /** How many times the pipeline has been retried */
    this.retryCount = 0;
    /** Multiplier applied to topKInitial on retry */
    this.topKMultiplier = 1;

    // ── Timing ─────────────────────────────────────────────────────────────
    this._startedAt = Date.now();
    /** Map of stage → duration in ms */
    this.timings = {};
  }

  /**
   * Total elapsed ms since context was created.
   * @returns {number}
   */
  elapsedMs() {
    return Date.now() - this._startedAt;
  }

  /**
   * Record how long a stage took.
   *
   * @param {string} stage
   * @param {number} durationMs
   */
  recordTiming(stage, durationMs) {
    this.timings[stage] = durationMs;
  }
}
