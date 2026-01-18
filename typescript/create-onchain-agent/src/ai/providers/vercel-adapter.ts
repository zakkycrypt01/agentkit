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
): any {
  // Set the API key in environment if provided
  if (apiKey && !process.env.OPENAI_API_KEY && provider === "OpenAI") {
    process.env.OPENAI_API_KEY = apiKey;
  }
  if (apiKey && !process.env.GOOGLE_GENERATIVE_AI_API_KEY && provider === "Gemini") {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
  }
  if (apiKey && !process.env.ANTHROPIC_API_KEY && provider === "Anthropic") {
    process.env.ANTHROPIC_API_KEY = apiKey;
  }

  switch (provider) {
    case "OpenAI":
      return openai(model as Parameters<typeof openai>[0]);

    case "Gemini":
      return google(model as Parameters<typeof google>[0]);

    case "Anthropic":
      return anthropic(model as Parameters<typeof anthropic>[0]);

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

