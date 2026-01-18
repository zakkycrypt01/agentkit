import { AIProvider } from "./base";
import { OpenAIProvider } from "./openai.js";
import { GeminiProvider } from "./gemini.js";
import { AnthropicProvider } from "./anthropic.js";

export type ModelProviderType = "OpenAI" | "Gemini" | "Anthropic";

export function createAIProvider(
  provider: ModelProviderType,
  apiKey: string,
  model?: string,
): AIProvider {
  switch (provider) {
    case "OpenAI":
      return new OpenAIProvider(apiKey, model);
    case "Gemini":
      return new GeminiProvider(apiKey, model);
    case "Anthropic":
      return new AnthropicProvider(apiKey, model);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}