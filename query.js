import "dotenv/config";
import { QueryService } from "./src/query/QueryService.js";

const question = process.argv[2] || "navigation between screens";

const queryService = new QueryService();
const response = await queryService.ask(question);

console.log("═".repeat(70));
console.log(`🤖 LLM ANSWER:`);
console.log("─".repeat(70));
console.log(response.answer);
console.log("─".repeat(70));

console.log(`\n📹 SOURCES (${response.sources.length} matching segments):`);
console.log("═".repeat(70));

if (response.sources.length > 0) {
  response.sources.forEach((src, idx) => {
    const score = (src.relevanceScore * 100).toFixed(1);
    console.log(`\n[Source #${idx + 1}]  (Relevance: ${score}%)`);
    console.log(`{`);
    console.log(`  text             : "${src.text}"`);
    console.log(`  moduleFolderName : "${src.moduleFolderName}"`);
    console.log(`  lessonTitle      : "${src.lessonTitle}"`);
    console.log(`  lessonSlug       : "${src.lessonSlug}"`);
    console.log(`  timeline         : "${src.timeline}"`);
    console.log(`  startTime        : "${src.startTime}"`);
    console.log(`  endTime          : "${src.endTime}"`);
    console.log(`}`);
    console.log("─".repeat(70));
  });
} else {
  console.log("No matching video sources found.");
}

console.log(`\n🎯 Confidence: ${response.confidence}% | Execution Time: ${response.timings.totalMs}ms\n`);
