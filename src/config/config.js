/**
 * Application configuration.
 * Covers both indexing (offline) and query (online) pipelines.
 */

import "dotenv/config";

export const config = {
  // ── Jina ──────────────────────────────────────────────────────────────────
  jina: {
    apiKey: process.env.JINA_API_KEY ?? "",
    model: process.env.JINA_MODEL ?? "jina-embeddings-v3",
    dimensions: Number(process.env.JINA_DIMENSIONS ?? 1024),
    /** task for indexing passages */
    task: process.env.JINA_TASK ?? "retrieval.passage",
    /** task for query-time embedding */
    queryTask: process.env.JINA_QUERY_TASK ?? "retrieval.query",
    rerankerModel:
      process.env.JINA_RERANKER_MODEL ??
      "jina-reranker-v2-base-multilingual",
  },

  // ── Qdrant ────────────────────────────────────────────────────────────────
  qdrant: {
    url: process.env.QDRANT_URL ?? "http://localhost:6333",
    apiKey: process.env.QDRANT_API_KEY ?? "",
    collectionName: process.env.QDRANT_COLLECTION ?? "course_chunks",
    vectorSize: Number(process.env.QDRANT_VECTOR_SIZE ?? 1024),
    distance: process.env.QDRANT_DISTANCE ?? "Cosine",
    upsertBatchSize: Number(process.env.QDRANT_UPSERT_BATCH_SIZE ?? 64),
  },

  // ── LLM ───────────────────────────────────────────────────────────────────
  llm: {
    /** Compatible with OpenAI, Groq, Together AI, Ollama, LM Studio, etc. */
    baseUrl: process.env.LLM_BASE_URL ?? "https://api.openai.com/v1",
    apiKey: process.env.LLM_API_KEY ?? "",
    model: process.env.LLM_MODEL ?? "gpt-4o-mini",
    temperature: Number(process.env.LLM_TEMPERATURE ?? 0.2),
    maxTokens: Number(process.env.LLM_MAX_TOKENS ?? 1024),
    timeoutMs: Number(process.env.LLM_TIMEOUT_MS ?? 30_000),
  },

  // ── Query pipeline ────────────────────────────────────────────────────────
  query: {
    /** Step 1: retrieve this many from Qdrant */
    topKInitial: Number(process.env.QUERY_TOP_K_INITIAL ?? 50),
    /** Step 2: keep this many after deduplication */
    topKSelect: Number(process.env.QUERY_TOP_K_SELECT ?? 20),
    /** Step 3: keep this many after reranking */
    topKFinal: Number(process.env.QUERY_TOP_K_FINAL ?? 5),
    /** Confidence score 0-100; below this → retry */
    confidenceThreshold: Number(process.env.CONFIDENCE_THRESHOLD ?? 60),
    maxRetries: Number(process.env.QUERY_MAX_RETRIES ?? 2),
    /** Enable Jina cross-encoder reranker */
    useReranker: process.env.USE_RERANKER !== "false",
    /** Enable MMR diversity reranker */
    useDiversity: process.env.USE_DIVERSITY !== "false",
    /** Approximate token budget for context sent to LLM */
    maxContextTokens: Number(process.env.MAX_CONTEXT_TOKENS ?? 3000),
  },

  // ── Rate limiting ─────────────────────────────────────────────────────────
  rateLimit: {
    requestsPerMinute: Number(process.env.RATE_LIMIT_RPM ?? 20),
    windowMs: 60_000,
  },

  // ── Chunking (indexing) ───────────────────────────────────────────────────
  chunking: {
    windowSeconds: Number(process.env.CHUNK_WINDOW_SECONDS ?? 15),
  },

  // ── Embedding batching ────────────────────────────────────────────────────
  embedding: {
    batchSize: Number(process.env.EMBEDDING_BATCH_SIZE ?? 32),
  },

  // ── Course path ───────────────────────────────────────────────────────────
  course: {
    rootPath: process.env.COURSE_PATH ?? "./class-subtitle",
  },
};
