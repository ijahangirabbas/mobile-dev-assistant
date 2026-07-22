/**
 * OpenAICompatibleLLM - Universal client for OpenAI, Groq, Together, LM Studio, Ollama, vLLM, etc.
 */

import { LLMService } from "./LLMService.js";
import { config } from "../../config/config.js";

export class OpenAICompatibleLLM extends LLMService {
  /**
   * @param {object} [options]
   * @param {string} [options.baseUrl]
   * @param {string} [options.apiKey]
   * @param {string} [options.model]
   * @param {number} [options.temperature]
   * @param {number} [options.maxTokens]
   */
  constructor({
    baseUrl = config.llm.baseUrl,
    apiKey = config.llm.apiKey,
    model = config.llm.model,
    temperature = config.llm.temperature,
    maxTokens = config.llm.maxTokens,
  } = {}) {
    super();
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.model = model;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
  }

  /**
   * Send chat completion request.
   *
   * @param {{ role: string; content: string }[]} messages
   * @param {object} [options]
   * @returns {Promise<string>}
   */
  async complete(messages, options = {}) {
    const url = `${this.baseUrl}/chat/completions`;
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const payload = {
      model: options.model || this.model,
      messages,
      temperature: options.temperature ?? this.temperature,
      max_tokens: options.maxTokens ?? this.maxTokens,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`LLM completion error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }
}
