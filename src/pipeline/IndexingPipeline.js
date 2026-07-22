/**
 * Main indexing orchestrator.
 *
 * Flow:
 *
 *   scan()    – discover .srt files  →  FileInfo[]
 *     ↓
 *   parse()   – read each file       →  Lesson[]
 *     ↓
 *   chunk()   – build 15-sec windows →  Chunk[]
 *     ↓
 *   embed()   – call Jina API        →  EmbeddedChunk[]
 *     ↓
 *   store()   – upsert to Qdrant
 *
 * This class coordinates everything.
 * It contains almost no business logic.
 * Each step is delegated to its own service.
 */

import { CourseScanner } from "../scanner/CourseScanner.js";
import { SrtParser } from "../parser/SrtParser.js";
import { ChunkBuilder } from "../chunking/ChunkBuilder.js";

export class IndexingPipeline {
  /**
   * @param {object} params
   * @param {import('../embeddings/JinaEmbeddingService.js').JinaEmbeddingService} params.embeddingService
   * @param {import('../vector/QdrantVectorStore.js').QdrantVectorStore}           params.vectorStore
   * @param {object}  [params.options]
   * @param {boolean} [params.options.dryRun]  if true, skip embed + store
   */
  constructor({ embeddingService, vectorStore, options = {} }) {
    this.scanner = new CourseScanner();
    this.parser = new SrtParser();
    this.chunker = new ChunkBuilder();
    this.embeddingService = embeddingService;
    this.vectorStore = vectorStore;
    this.dryRun = options.dryRun ?? false;
  }

  /**
   * Run the full indexing pipeline.
   *
   * @param {string} coursePath   root directory to scan
   * @returns {Promise<PipelineResult>}
   */
  async run(coursePath) {
    const result = {
      totalFiles: 0,
      totalLessons: 0,
      totalChunks: 0,
      totalUpserted: 0,
      skippedFiles: 0,
      errors: [],
    };

    // ── 1. SCAN ──────────────────────────────────────────────────────────────
    console.log(`\n[Pipeline] Scanning: ${coursePath}`);
    const fileInfos = await this.scanner.scan(coursePath);
    result.totalFiles = fileInfos.length;
    console.log(`[Pipeline] Found ${fileInfos.length} .srt file(s)`);

    if (fileInfos.length === 0) {
      console.warn("[Pipeline] No files found. Check COURSE_PATH in .env");
      return result;
    }

    // ── 2. Ensure collection exists ──────────────────────────────────────────
    if (!this.dryRun) {
      await this.vectorStore.ensureCollection();
    }

    // ── 3. PARSE → CHUNK → EMBED → STORE  (per lesson) ──────────────────────
    for (const fileInfo of fileInfos) {
      const label =
        `[${fileInfo.normalized.moduleFolderName}] ` +
        `${fileInfo.normalized.lessonTitle}`;

      try {
        // Parse
        console.log(`\n[Pipeline] Parsing   → ${label}`);
        const lesson = await this.parser.parse(fileInfo);
        result.totalLessons++;

        if (lesson.stats.entryCount === 0) {
          console.warn(`[Pipeline] ⚠ No subtitle entries in ${label}`);
          result.skippedFiles++;
          continue;
        }

        console.log(
          `[Pipeline]   entries=${lesson.stats.entryCount}  ` +
          `duration=${(lesson.stats.totalDurationMs / 60000).toFixed(1)}min`
        );

        // Chunk
        const chunks = this.chunker.build(lesson);
        result.totalChunks += chunks.length;
        console.log(`[Pipeline] Chunking  → ${chunks.length} chunks (15s windows)`);

        // Log a sample of chunk timelines
        const samples = chunks.slice(0, 3).map((c) => c.timeline).join(" | ");
        console.log(`[Pipeline]   sample timelines: ${samples}${chunks.length > 3 ? " …" : ""}`);

        if (this.dryRun) {
          console.log("[Pipeline] DRY RUN – skipping embed + store");
          continue;
        }

        // Embed
        console.log(`[Pipeline] Embedding → ${chunks.length} texts via Jina`);
        const embeddedChunks = await this.embeddingService.embedChunks(chunks);

        // Store
        console.log(`[Pipeline] Storing   → ${embeddedChunks.length} points → Qdrant`);
        await this.vectorStore.upsert(embeddedChunks);
        result.totalUpserted += embeddedChunks.length;

      } catch (err) {
        console.error(`[Pipeline] ✗ Error processing ${label}:`, err.message);
        result.errors.push({ label, error: err.message });
      }
    }

    // ── 4. SUMMARY ───────────────────────────────────────────────────────────
    this._printSummary(result);

    return result;
  }

  /**
   * @param {PipelineResult} result
   */
  _printSummary(result) {
    console.log("\n" + "─".repeat(50));
    console.log("[Pipeline] ✅ Indexing complete");
    console.log(`  Files scanned  : ${result.totalFiles}`);
    console.log(`  Lessons parsed : ${result.totalLessons}`);
    console.log(`  Chunks built   : ${result.totalChunks}`);
    console.log(`  Points upserted: ${result.totalUpserted}`);
    if (result.skippedFiles > 0) {
      console.log(`  Skipped files  : ${result.skippedFiles}`);
    }
    if (result.errors.length > 0) {
      console.log(`  Errors         : ${result.errors.length}`);
      result.errors.forEach((e) => console.log(`    - ${e.label}: ${e.error}`));
    }
    console.log("─".repeat(50));
  }
}

/**
 * @typedef {object} PipelineResult
 * @property {number} totalFiles
 * @property {number} totalLessons
 * @property {number} totalChunks
 * @property {number} totalUpserted
 * @property {number} skippedFiles
 * @property {{ label: string; error: string }[]} errors
 */
