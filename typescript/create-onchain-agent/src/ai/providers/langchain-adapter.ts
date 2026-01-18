/**
 * LangChain Adapter for AI Providers
 * 
 * Converts generic AI providers to LangChain-compatible models
 */

import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatAnthropic } from "@langchain/anthropic";
import type { ModelProviderType } from "./factory.js";

export function createLangChainModel(
  provider: ModelProviderType,
  apiKey: string,
  model: string,
) {
  switch (provider) {
    case "OpenAI":
      return new ChatOpenAI({
        apiKey,
        model,
        temperature: 0.7,
        maxTokens: 1024,
      });

    case "Gemini":
      return new ChatGoogleGenerativeAI({
        apiKey,
        model,
        temperature: 0.7,
        maxOutputTokens: 1024,
      });

    case "Anthropic":
      return new ChatAnthropic({
        apiKey,
        model,
        temperature: 0.7,
        maxTokens: 1024,
      });

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
