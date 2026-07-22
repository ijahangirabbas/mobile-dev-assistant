import { QueryService } from "./src/query/QueryService.js";

console.log("=== Testing RAG Query Pipeline ===");

const queryService = new QueryService();
const question = "How do I setup navigation in React Native?";

console.log(`\nUser Question: "${question}"\n`);
console.log("Executing Query Pipeline...");

try {
  const result = await queryService.ask(question);

  console.log("\n---------------- RESULTS ----------------");
  console.log("Answer      :", result.answer);
  console.log("Confidence  :", result.confidence + "%");
  console.log("Intent      :", result.intent);
  console.log("Total Time  :", result.timings.totalMs + "ms");
  console.log("Retries     :", result.retries);
  console.log("\nSources:");
  result.sources.forEach((s, i) => {
    console.log(`  [${i + 1}] ${s.lesson} (${s.timeline}) - Score: ${s.relevanceScore}`);
  });
  console.log("-----------------------------------------\n");
} catch (err) {
  console.error("Query test failed:", err);
}
