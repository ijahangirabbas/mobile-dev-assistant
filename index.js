/**
 * Entry point.
 *
 * Wires services together and runs the indexing pipeline.
 * All configuration comes from .env (via src/config/config.js).
 *
 * Usage:
 *   node index.js
 *   node index.js --dry-run      (parse + chunk only, no embed/store)
 */

import "dotenv/config";
import { config } from "./src/config/config.js";
import { IndexingPipeline } from "./src/pipeline/IndexingPipeline.js";
import { JinaEmbeddingService } from "./src/embeddings/JinaEmbeddingService.js";
import { QdrantVectorStore } from "./src/vector/QdrantVectorStore.js";

const dryRun = process.argv.includes("--dry-run");

if (dryRun) {
  console.log("[Main] ⚡ DRY RUN mode – embed + store steps will be skipped");
}

const embeddingService = new JinaEmbeddingService();
const vectorStore = new QdrantVectorStore();

const pipeline = new IndexingPipeline({
  embeddingService,
  vectorStore,
  options: { dryRun },
});

await pipeline.run(config.course.rootPath);
