/**
 * PromptBuilder - Combines SystemPrompt, Context, and UserPrompt into final message structure for LLM.
 */

import { SYSTEM_PROMPT } from "./SystemPrompt.js";
import { buildUserPrompt } from "./UserPrompt.js";

export class PromptBuilder {
  /**
   * @param {string} question
   * @param {string} context
   * @returns {{ system: string, user: string, messages: { role: string, content: string }[] }}
   */
  build(question, context) {
    const userMessageContent = buildUserPrompt(question, context);

    return {
      system: SYSTEM_PROMPT,
      user: userMessageContent,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessageContent },
      ],
    };
  }
}
