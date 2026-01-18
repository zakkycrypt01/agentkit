/**
 * Vercel AI SDK Adapter for AI Providers
 * 
 * Converts generic AI providers to Vercel AI SDK-compatible models
 */

import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import type { ModelProviderType } from "./factory.js";

export function createVercelAIModel(
  provider: ModelProviderType,
  apiKey: string,
  model: string,
) {
  switch (provider) {
    case "OpenAI":
      return openai(model, {
        apiKey,
      });

    case "Gemini":
      return google(model, {
        apiKey,
      });

    case "Anthropic":
      return anthropic(model, {
        apiKey,
      });

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
