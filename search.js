import { QdrantVectorStore } from "./src/vector/QdrantVectorStore.js";
import { QueryEmbeddingService } from "./src/query/retrieval/QueryEmbeddingService.js";
import { mapSearchResults } from "./src/query/retrieval/SearchResultMapper.js";

// Read query from command line argument
const question = process.argv[2] || "navigation between screens";

console.log(`\n🔍 Searching Qdrant (No LLM needed) for: "${question}"\n`);

try {
  // 1. Get embedding for the question from Jina
  const embedder = new QueryEmbeddingService();
  console.log("⏳ Generating query embedding...");
  const vector = await embedder.embed(question);

  // 2. Search Qdrant
  const store = new QdrantVectorStore();
  console.log("⏳ Searching Qdrant vector database...\n");
  const rawResults = await store.search(vector, 5); // Top 5 matching video clips
  const results = mapSearchResults(rawResults);

  if (results.length === 0) {
    console.log("⚠️ No matching video segments found in Qdrant.");
  } else {
    console.log(`✅ Found ${results.length} relevant video segments:\n`);
    console.log("═".repeat(65));

    results.forEach((r, idx) => {
      const matchPercentage = (r.score * 100).toFixed(1);
      console.log(`\n[#${idx + 1}] Score: ${matchPercentage}% Match`);
      console.log(`📹 Lesson  : ${r.meta.lessonTitle}`);
      console.log(`📁 Module  : ${r.meta.moduleFolderName}`);
      console.log(`⏱️ Timeline: ${r.timeline}`);
      console.log(`📝 Text    : "${r.text}"`);
      console.log("─".repeat(65));
    });
  }
} catch (err) {
  console.error("❌ Search failed:", err.message);
  console.log("\nMake sure:");
  console.log("1. Qdrant is running on http://localhost:6333");
  console.log("2. JINA_API_KEY is set in your .env file");
}
