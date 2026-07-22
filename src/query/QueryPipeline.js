/**
 * QueryPipeline - Complete Orchestrator for Online Retrieval & Answer Generation.
 */

import { QueryContext } from "./QueryContext.js";
import { InputGuardPipeline } from "./guards/InputGuardPipeline.js";
import { normalizeQuery } from "./preprocess/QueryNormalizer.js";
import { detectIntent } from "./preprocess/IntentDetector.js";
import { expandQuery } from "./preprocess/QueryExpander.js";
import { rewriteQuery } from "./preprocess/QueryRewriter.js";
import { QueryEmbeddingService } from "./retrieval/QueryEmbeddingService.js";
import { Retriever } from "./retrieval/Retriever.js";
import { CandidateSelector } from "./retrieval/CandidateSelector.js";
import { SimilarityRanker } from "./ranking/SimilarityRanker.js";
import { CrossEncoderRanker } from "./ranking/CrossEncoderRanker.js";
import { DiversityRanker } from "./ranking/DiversityRanker.js";
import { ContextBuilder } from "./retrieval/ContextBuilder.js";
import { PromptBuilder } from "./prompt/PromptBuilder.js";
import { OpenAICompatibleLLM } from "./llm/OpenAICompatibleLLM.js";
import { ResponseEvaluator } from "./validation/ResponseEvaluator.js";
import { RetryManager } from "./validation/RetryManager.js";
import { ResponseFormatter } from "./formatter/ResponseFormatter.js";
import { config } from "../config/config.js";

export class QueryPipeline {
  /**
   * @param {object} params
   * @param {import('../vector/QdrantVectorStore.js').QdrantVectorStore} params.vectorStore
   * @param {QueryEmbeddingService} [params.embeddingService]
   * @param {OpenAICompatibleLLM} [params.llmService]
   */
  constructor({ vectorStore, embeddingService, llmService }) {
    this.vectorStore = vectorStore;
    this.embeddingService = embeddingService || new QueryEmbeddingService();
    this.hasLlmConfigured = Boolean(config.llm.apiKey && config.llm.apiKey.trim().length > 0);
    this.llmService = llmService || (this.hasLlmConfigured ? new OpenAICompatibleLLM() : null);

    this.inputGuards = new InputGuardPipeline();
    this.retriever = new Retriever(this.vectorStore);
    this.candidateSelector = new CandidateSelector();
    this.similarityRanker = new SimilarityRanker();
    this.crossEncoderRanker = new CrossEncoderRanker();
    this.diversityRanker = new DiversityRanker();
    this.contextBuilder = new ContextBuilder();
    this.promptBuilder = new PromptBuilder();
    this.evaluator = new ResponseEvaluator();
    this.retryManager = new RetryManager();
    this.formatter = new ResponseFormatter();
  }

  /**
   * Execute the full pipeline for a given user query.
   *
   * @param {string} rawQuery
   * @param {string} [userId="anonymous"]
   * @returns {Promise<object>} Formatted response JSON
   */
  async execute(rawQuery, userId = "anonymous") {
    const ctx = new QueryContext(rawQuery);

    // 1. Input Guards
    const guardStart = Date.now();
    const guardCheck = this.inputGuards.run(rawQuery, userId);
    ctx.recordTiming("inputGuards", Date.now() - guardStart);

    if (!guardCheck.passed) {
      ctx.finalAnswer = `Request rejected: ${guardCheck.reason}`;
      ctx.confidence = 0;
      return this.formatter.format(ctx);
    }
    ctx.sanitizedQuery = guardCheck.sanitized;

    // 2. Preprocess
    const preStart = Date.now();
    ctx.normalizedQuery = normalizeQuery(ctx.sanitizedQuery);
    ctx.intent = detectIntent(ctx.normalizedQuery);
    ctx.expandedTerms = expandQuery(ctx.normalizedQuery);

    // Only rewrite if LLM is active
    if (this.llmService) {
      ctx.rewrittenQuery = await rewriteQuery(ctx.normalizedQuery, this.llmService);
    } else {
      ctx.rewrittenQuery = ctx.normalizedQuery;
    }
    ctx.recordTiming("preprocess", Date.now() - preStart);

    // Conversational shortcut
    if (ctx.intent === "conversational") {
      ctx.finalAnswer = "Hello! I am your course assistant. Ask me any question about the course content or video lessons.";
      ctx.confidence = 100;
      return this.formatter.format(ctx);
    }

    // Pipeline loop
    let complete = false;
    while (!complete) {
      // 3. Query Embedding
      const embedStart = Date.now();
      ctx.queryVector = await this.embeddingService.embed(ctx.rewrittenQuery, ctx.expandedTerms);
      ctx.recordTiming("queryEmbedding", Date.now() - embedStart);

      // 4. Retrieval (Top 50 * multiplier)
      const retStart = Date.now();
      const initialK = Math.round(config.query.topKInitial * ctx.topKMultiplier);
      ctx.candidates = await this.retriever.retrieve(ctx.queryVector, initialK);
      ctx.recordTiming("retrieval", Date.now() - retStart);

      if (ctx.candidates.length === 0) {
        ctx.finalAnswer = "I couldn't find any relevant video lessons matching your question in the course material.";
        ctx.confidence = 0;
        return this.formatter.format(ctx);
      }

      // 5. Candidate Selection (Deduplication -> Top 20)
      const selStart = Date.now();
      ctx.selectedCandidates = this.candidateSelector.select(ctx.candidates);
      ctx.recordTiming("candidateSelection", Date.now() - selStart);

      // 6. Ranking (Cross-Encoder / Similarity -> Diversity -> Top 5)
      const rankStart = Date.now();
      let ranked = (config.query.useReranker && config.jina.apiKey)
        ? await this.crossEncoderRanker.rank(ctx.normalizedQuery, ctx.selectedCandidates)
        : await this.similarityRanker.rank(ctx.normalizedQuery, ctx.selectedCandidates);

      if (config.query.useDiversity) {
        ranked = await this.diversityRanker.rank(ctx.normalizedQuery, ranked);
      }

      ctx.rankedResults = ranked.slice(0, config.query.topKFinal);
      ctx.recordTiming("ranking", Date.now() - rankStart);

      // 7. Context Building
      const ctxStart = Date.now();
      const { context, sources } = this.contextBuilder.build(ctx.rankedResults);
      ctx.context = context;
      ctx.sources = sources;
      ctx.recordTiming("contextBuilding", Date.now() - ctxStart);

      // If no LLM configured, format search summary and return immediately (no LLM retries)
      if (!this.llmService) {
        ctx.finalAnswer = `[Vector Search Mode]\nRetrieved ${ctx.sources.length} matching video segment(s).`;
        ctx.confidence = Math.round((ctx.rankedResults[0]?.score || 0) * 100);
        return this.formatter.format(ctx);
      }

      // 8. Prompt Building
      ctx.prompt = this.promptBuilder.build(ctx.normalizedQuery, ctx.context);

      // 9. LLM Completion
      const llmStart = Date.now();
      ctx.rawAnswer = await this.llmService.complete(ctx.prompt.messages);
      ctx.recordTiming("llmCompletion", Date.now() - llmStart);

      // 10. Response Evaluation
      const evalStart = Date.now();
      ctx.evaluation = this.evaluator.evaluate(ctx.rawAnswer, ctx.context, ctx.sources, ctx.rankedResults);
      ctx.confidence = ctx.evaluation.confidence;
      ctx.recordTiming("evaluation", Date.now() - evalStart);

      // 11. Check Retry Condition
      if (this.retryManager.shouldRetry(ctx)) {
        this.retryManager.prepareRetry(ctx);
      } else {
        ctx.finalAnswer = ctx.rawAnswer;
        complete = true;
      }
    }

    return this.formatter.format(ctx);
  }
}
