/**
 * Builds the context string sent to the LLM.
 */

import { config } from "../../config/config.js";

const CHARS_PER_TOKEN = 4;

export class ContextBuilder {
  /**
   * @param {object} [options]
   * @param {number} [options.maxTokens]
   */
  constructor({ maxTokens = config.query.maxContextTokens } = {}) {
    this.maxTokens = maxTokens;
  }

  /**
   * @param {import('../../models/SearchResult.js').SearchResult[]} results
   * @returns {{ context: string; sources: ContextSource[] }}
   */
  build(results) {
    const sources = [];
    const sections = [];
    let budgetChars = this.maxTokens * CHARS_PER_TOKEN;

    for (const [i, result] of results.entries()) {
      const header =
        `[${i + 1}] ${result.meta.lessonTitle} | ${result.timeline}`;
      const block = `${header}\n${result.text}`;

      if (block.length > budgetChars) break;

      sections.push(block);
      budgetChars -= block.length;

      const [startTime = "", endTime = ""] = (result.timeline || "").split(" - ");

      sources.push({
        index: i + 1,
        lessonTitle: result.meta.lessonTitle,
        moduleFolderName: result.meta.moduleFolderName,
        timeline: result.timeline,
        startTime,
        endTime,
        lessonSlug: result.meta.lessonSlug,
        text: result.text,
        score: result.score,
      });
    }

    return {
      context: sections.join("\n\n---\n\n"),
      sources,
    };
  }
}

/**
 * @typedef {object} ContextSource
 * @property {number} index
 * @property {string} lessonTitle
 * @property {string} moduleFolderName
 * @property {string} timeline
 * @property {string} startTime
 * @property {string} endTime
 * @property {string} lessonSlug
 * @property {string} text
 * @property {number} score
 */
