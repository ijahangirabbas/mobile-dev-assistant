/**
 * Expands the query with domain-related synonyms and related terms.
 *
 * Strategy:
 *
 * 1. Tokenize query into lowercase words
 * 2. Match each word against the synonym dictionary
 * 3. Collect unique expansion terms (excluding terms already in the query)
 * 4. Return as an array — caller decides how to use them
 *
 * The expanded terms are appended to the query embedding input to
 * improve recall without changing the query the user sees.
 *
 * Pure function.
 */

/** Domain-specific synonym map for React Native / mobile courses */
const SYNONYMS = new Map([
  ["navigation",    ["routing", "navigator", "screen", "stack", "tab"]],
  ["state",         ["useState", "redux", "zustand", "store", "context"]],
  ["component",     ["JSX", "view", "element", "widget"]],
  ["style",         ["stylesheet", "styling", "flex", "layout"]],
  ["api",           ["fetch", "axios", "request", "endpoint", "REST"]],
  ["animation",     ["animated", "reanimated", "gesture", "transition"]],
  ["camera",        ["expo-camera", "capture", "photo", "video", "permission"]],
  ["sensor",        ["accelerometer", "gyroscope", "pedometer", "magnetometer"]],
  ["storage",       ["asyncstorage", "sqlite", "mmkv", "persist"]],
  ["auth",          ["authentication", "login", "jwt", "token", "oauth"]],
  ["install",       ["setup", "configure", "init", "npx", "expo install"]],
  ["error",         ["exception", "crash", "debug", "fix", "issue"]],
  ["performance",   ["optimize", "memo", "usecallback", "lazy", "profiler"]],
  ["hook",          ["useeffect", "usestate", "usememo", "usecallback", "useref"]],
  ["permission",    ["access", "allow", "grant", "request permission"]],
]);

/**
 * @param {string} query
 * @returns {string[]}  additional terms to append to the query for embedding
 */
export function expandQuery(query) {
  const tokens = new Set(query.toLowerCase().match(/\b\w+\b/g) ?? []);
  const expanded = new Set();

  for (const [term, synonyms] of SYNONYMS) {
    if (tokens.has(term)) {
      synonyms.forEach((s) => {
        if (!tokens.has(s.toLowerCase())) {
          expanded.add(s);
        }
      });
    }
  }

  return [...expanded];
}
