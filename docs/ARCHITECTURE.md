# Architecture Overview: Void Intelligence

Void Intelligence utilizes a **Graph-of-Agents (GoA)** framework to overcome the limitations of single-agent reasoning. By parallelizing the generation and scoring process, the engine achieves higher accuracy and semantic depth.

## 1. Graph-of-Agents (GoA) Pipeline

The core reasoning engine (`lib/goa/engine.ts`) follows a strict 5-stage deterministic pipeline:

1.  **Sampling**: Analyze the user query to determine the required expertise and sampling density.
2.  **Parallel Generation**: Dispatch multiple specialized agents (e.g., `ring-2.6-1t`) to generate diverse perspectives on the problem.
3.  **Matrix-Scoring**: Use a "Scorer" agent to evaluate all generated responses based on relevance, factual density, and logical consistency.
4.  **Refinement**: Selected high-scoring responses are combined and refined by a heavy-reasoning model (`qwen3-thinking`).
5.  **Synthesis (Pooling)**: The final response is synthesized and streamed to the user via Server-Sent Events (SSE).

## 2. Knowledge Graph (KG) Integration

Every interaction with the engine triggers a background extraction task:

- **Extractor**: `lib/kg/extraction.ts` uses the `Owl Alpha` model to identify "Subject-Predicate-Object" triplets within the conversation transcript.
- **Persistence**: Triplets are stored in a local SQLite database (`lib/kg/db.ts`) using the `libsql` client.
- **Visualization**: The front-end renders these triplets as an interactive graph using **React Flow**, allowing users to explore the conceptual map of their intelligence store.

## 3. Privacy & Security Layer

To maintain absolute data privacy, a zero-trust guardrail is implemented:

- **PII Redaction**: Before sending any data to OpenRouter, the `redactPII` utility (`lib/utils/redaction.ts`) masks Emails, Phone Numbers, API Keys, and SSNs.
- **Client-Side Processing**: Redaction happens on the client or server-edge before external API calls, and values are restored locally after the response is received.

## 4. Component Hierarchy

- `app/page.tsx`: Main chat state orchestrator.
- `lib/goa/`: Logic for multi-agent coordination.
- `lib/openrouter/`: Resilience layer for API communication (Retry/Backoff).
- `components/`: Pure UI components (FeatureCards, ChatInput, Sidebar).
- `lib/design-tokens.ts`: The source of truth for the Cyber-Brutalist design system.

## 5. Resilience Strategy

The system is designed for high reliability:
- **Exponential Backoff**: `chatWithRetry` handles 429 (Rate Limit) errors from OpenRouter free-tier.
- **Error Boundaries**: React Error Boundaries catch rendering failures and provide a graceful recovery UI.
- **Validation**: Zod is used to validate API responses and configuration schemas.
