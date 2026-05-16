import { LLMProvider, ChatMessage, ChatOptions } from "../ports/llm";
import { chatWithRetry, streamChat } from "../openrouter/client";

export class OpenRouterAdapter implements LLMProvider {
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    return chatWithRetry(messages, options || {});
  }

  async stream(messages: ChatMessage[], options: ChatOptions, onToken: (token: string) => void): Promise<void> {
    return streamChat(messages, options, onToken);
  }
}
