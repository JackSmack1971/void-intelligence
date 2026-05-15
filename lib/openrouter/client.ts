import { z } from "zod";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  intent?: "sampling" | "scoring" | "refinement" | "synthesis";
  temperature?: number;
  max_tokens?: number;
  json_mode?: boolean;
}

const MODEL_TIERS = {
  CHEAP: "google/gemini-2.0-flash-001", // Very fast and free/cheap
  MEDIUM: "meta-llama/llama-3.3-70b-instruct:free",
  PREMIUM: "anthropic/claude-3.5-sonnet", // High quality for synthesis/refinement
};

export function modelRouter(intent?: string): string {
  switch (intent) {
    case "sampling":
    case "scoring":
      return MODEL_TIERS.CHEAP;
    case "refinement":
      return MODEL_TIERS.MEDIUM;
    case "synthesis":
      return MODEL_TIERS.PREMIUM;
    default:
      return MODEL_TIERS.CHEAP;
  }
}

export async function chat(messages: ChatMessage[], options: ChatOptions) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not defined");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://void-intelligence.local", // Required by OpenRouter
      "X-Title": "Void Intelligence",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || modelRouter(options.intent),
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens,
      response_format: options.json_mode ? { type: "json_object" } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error("Rate limit exceeded on OpenRouter free tier");
    }
    throw new Error(`OpenRouter API error: ${response.status} ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content as string;
}

/**
 * Exponential backoff wrapper for API calls
 */
export async function chatWithRetry(
  messages: ChatMessage[],
  options: ChatOptions,
  maxRetries = 3
): Promise<string> {
  let lastError: Error | null = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await chat(messages, options);
    } catch (err: any) {
      lastError = err;
      if (err.message.includes("Rate limit")) {
        const wait = Math.pow(2, i) * 2000;
        console.warn(`Rate limit hit, retrying in ${wait}ms...`);
        await new Promise(resolve => setTimeout(resolve, wait));
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error("Max retries exceeded");
}

/**
 * Streaming chat implementation
 */
export async function streamChat(
  messages: ChatMessage[],
  options: ChatOptions,
  onToken: (token: string) => void
): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not defined");

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://void-intelligence.local",
      "X-Title": "Void Intelligence",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || modelRouter(options.intent),
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens,
      stream: true,
    }),
  });

  if (!response.ok) throw new Error(`Streaming failed: ${response.status}`);

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter(line => line.trim() !== "");

    for (const line of lines) {
      if (line === "data: [DONE]") return;
      if (line.startsWith("data: ")) {
        try {
          const json = JSON.parse(line.substring(6));
          const token = json.choices[0]?.delta?.content || "";
          if (token) onToken(token);
        } catch (e) {
          // Ignore parse errors for incomplete chunks
        }
      }
    }
  }
}
