export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatOptions {
  model?: string;
  intent?: "sampling" | "scoring" | "refinement" | "synthesis";
  json_mode?: boolean;
}

export interface LLMProvider {
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
  stream(messages: ChatMessage[], options: ChatOptions, onToken: (token: string) => void): Promise<void>;
}
