import fs from "fs/promises";
import path from "path";
import pc from "picocolors";
import prompts from "prompts";
import { copyTemplate } from "../common/fileSystem.js";

type AgentFramework = "langchain" | "vercelAISDK";
type AIProvider = "OpenAI" | "Gemini" | "Anthropic";

/**
 * Creates an agent by selecting a framework and AI provider, then copying the appropriate template.
 *
 * - Prompts user to select between LangChain and Vercel AI SDK frameworks
 * - Prompts user to select between OpenAI, Gemini, and Anthropic AI providers
 * - Copies the selected framework's agent implementation
 * - Cleans up unused framework files
 */
export async function createAgent() {
  let result: prompts.Answers<"framework" | "provider">;

  try {
    result = await prompts(
      [
        {
          type: "select",
          name: "framework",
          message: pc.reset("Choose a framework:"),
          choices: [
            { title: "LangChain", value: "langchain" },
            { title: "Vercel AI SDK", value: "vercelAISDK" },
          ] as { title: string; value: AgentFramework }[],
        },
        {
          type: "select",
          name: "provider",
          message: pc.reset("Choose an AI provider:"),
          choices: [
            { title: "OpenAI", value: "OpenAI" },
            { title: "Gemini", value: "Gemini" },
            { title: "Anthropic", value: "Anthropic" },
          ] as { title: string; value: AIProvider }[],
        },
      ],
      {
        onCancel: () => {
          console.log("\nAgent creation cancelled.");
          process.exit(0);
        },
      },
    );
  } catch (error) {
    console.error("An error occurred during agent creation", error);
    process.exit(1);
  }

  const { framework, provider } = result;

  try {
    const root = await copyTemplate("createAgent", "createAgent");

    // Copy the selected framework's implementation to the destination
    const selectedRoutePath = path.join(root, "framework", framework, "createAgent.ts");
    const newRoutePath = path.join(process.cwd(), "createAgent.ts");

    await fs.copyFile(selectedRoutePath, newRoutePath);

    // Copy the AI provider factory and base files
    const aiProviderSrcDir = path.join(root, "..", "..", "src", "ai", "providers");
    const aiProviderDestDir = path.join(process.cwd(), "ai", "providers");

    // Ensure destination directory exists
    await fs.mkdir(aiProviderDestDir, { recursive: true });

    // Copy all provider files
    const providerFiles = ["base.ts", "factory.ts", "anthropic.ts", "gemini.ts", "openai.ts"];
    for (const file of providerFiles) {
      const srcFile = path.join(aiProviderSrcDir, file);
      const destFile = path.join(aiProviderDestDir, file);
      await fs.copyFile(srcFile, destFile);
    }

    // Create an index file to export the factory
    const indexPath = path.join(aiProviderDestDir, "index.ts");
    await fs.writeFile(
      indexPath,
      `export { createAIProvider } from "./factory.js";
export type { ModelProviderType } from "./factory.js";
export type { AIProvider, Message } from "./base.js";
`,
    );

    // Create a config file with selected provider for the user
    const configPath = path.join(process.cwd(), "ai", "config.ts");
    await fs.writeFile(
      configPath,
      `/**
 * AI Provider Configuration
 * 
 * Configure your preferred AI provider and model here.
 * Supported providers: "OpenAI" | "Gemini" | "Anthropic"
 */

export const AI_PROVIDER = "${provider}";

// Configure your API key - can be set via environment variable or here
export const AI_API_KEY = process.env.AI_API_KEY || "";

// Default models for each provider (can be overridden)
export const DEFAULT_MODELS = {
  OpenAI: "gpt-4o-mini",
  Gemini: "gemini-2.5-flash-lite",
  Anthropic: "claude-3-5-sonnet-20241022",
};

export function getDefaultModel() {
  return DEFAULT_MODELS[AI_PROVIDER as keyof typeof DEFAULT_MODELS];
}
`,
    );

    // Clean up the temporary directory
    await fs.rm(root, { recursive: true, force: true });

    console.log(pc.green("Successfully created createAgent.ts"));
    console.log(pc.cyan(`Selected Provider: ${provider}`));
    console.log(pc.cyan(`Selected Framework: ${framework}`));
    console.log(
      pc.yellow(
        "\nNext steps:\n1. Set your AI_API_KEY environment variable\n2. Customize ai/config.ts to change the provider or model\n3. Update createAgent.ts to use the AI provider factory if needed",
      ),
    );
  } catch (error) {
    console.error("Error setting up createAgent:", error);
    process.exit(1);
  }
}
