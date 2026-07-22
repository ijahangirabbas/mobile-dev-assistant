/**
 * Detects the intent of the user query.
 *
 * Intent types:
 *
 *   "question"       – ends with "?", starts with how/what/why/when/where/which/who
 *   "command"        – starts with show/list/give/find/explain/describe
 *   "conversational" – greeting or short social phrase
 *   "unknown"        – anything else
 *
 * Pure function – keyword-based, no ML model required.
 */

const QUESTION_STARTERS = /^(how|what|why|when|where|which|who|whose|is|are|can|could|should|does|do|did|will|would)\b/i;
const COMMAND_STARTERS  = /^(show|list|give|find|explain|describe|tell|summarize|compare|define|help)\b/i;
const GREETINGS         = /^(hi|hello|hey|good\s+(morning|afternoon|evening)|thanks|thank\s+you|bye|goodbye)\b/i;

/**
 * @param {string} query
 * @returns {"question" | "command" | "conversational" | "unknown"}
 */
export function detectIntent(query) {
  const q = query.trim();

  if (GREETINGS.test(q)) return "conversational";
  if (q.endsWith("?") || QUESTION_STARTERS.test(q)) return "question";
  if (COMMAND_STARTERS.test(q)) return "command";

  return "unknown";
}
