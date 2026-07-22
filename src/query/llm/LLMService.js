/**
 * Abstract LLMService interface.
 */

export class LLMService {
  /**
   * @param {{ role: string; content: string }[]} messages
   * @param {object} [options]
   * @returns {Promise<string>}
   */
  async complete(messages, options = {}) {
    throw new Error(`${this.constructor.name} must implement complete(messages, options)`);
  }
}
