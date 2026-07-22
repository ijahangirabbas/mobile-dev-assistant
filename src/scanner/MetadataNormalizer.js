/**
 * Converts folder names into structured metadata.
 *
 * Examples:
 *
 *   "module 02"           →  moduleNumber = 2
 *
 *   "02_react-native-vs-expo_epm"
 *                         →  lessonNumber = 2
 *                            lessonTitle  = "react native vs expo epm"
 *                            lessonSlug   = "react-native-vs-expo-epm"
 *
 * Pure utility – no I/O, no side effects.
 */

import {
  FOLDER_NUMBER_REGEX,
  FOLDER_PREFIX_STRIP_REGEX,
} from "../config/constants.js";

/**
 * Extract the leading integer from a folder name.
 *
 * @param {string} folderName
 * @returns {number|null}
 */
export function extractNumber(folderName) {
  const match = folderName.match(FOLDER_NUMBER_REGEX);
  if (!match) return null;
  return Number(match[0]);
}

/**
 * Extract a human-readable lesson title from a folder name.
 *
 * Steps:
 *   1. Strip leading numeric prefix + separator  "02_react-native" → "react-native"
 *   2. Replace underscores and hyphens with spaces
 *   3. Trim
 *
 * @param {string} folderName
 * @returns {string}
 */
export function extractTitle(folderName) {
  const clean = folderName
    .replace(FOLDER_PREFIX_STRIP_REGEX, "")
    .replace(/_epm|_ch\d*|\bepm\b|\bch\d*\b/gi, "")
    .replace(/[_-]+/g, " ")
    .trim();

  const titleStr = clean || folderName.replace(/[_-]+/g, " ").trim();

  return titleStr
    .split(" ")
    .filter(Boolean)
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && ["vs", "and", "or", "in", "of", "to", "for", "a", "an", "the", "with", "on", "at"].includes(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Create a URL-safe slug from a folder name.
 *
 * Steps:
 *   1. Strip leading numeric prefix + separator
 *   2. Replace underscores with hyphens
 *   3. Lowercase
 *
 * @param {string} folderName
 * @returns {string}
 */
export function createSlug(folderName) {
  return folderName
    .replace(FOLDER_PREFIX_STRIP_REGEX, "")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}
