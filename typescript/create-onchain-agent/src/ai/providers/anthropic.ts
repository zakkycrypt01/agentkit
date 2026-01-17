import Anthropic from "@anthropic-ai/sdk";
import { AIProvider, Message } from "./base.js";

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = "claude-3-5-sonnet-20241022") {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async chat(messages: Message[]): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: messages.map(msg => ({
        role: msg.role === "system" ? "user" : msg.role,
        content: msg.content,
      })),
    });

    const content = response.content[0];
    return content.type === "text" ? content.text : "";
  }

  async *streamChat(messages: Message[]): AsyncGenerator<string> {
    const stream = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: messages.map(msg => ({
        role: msg.role === "system" ? "user" : msg.role,
        content: msg.content,
      })),
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
  }
}
