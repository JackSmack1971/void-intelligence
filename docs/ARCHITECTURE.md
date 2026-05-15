# Architecture Overview: Void Intelligence

Void Intelligence utilizes a **Graph-of-Agents (GoA)** framework to overcome the limitations of single-agent reasoning. By parallelizing the generation and scoring process, the engine achieves higher accuracy and semantic depth.

## 1. Graph-of-Agents (GoA) Pipeline

The core reasoning engine (`lib/goa/engine.ts`) follows a strict 5-stage deterministic pipeline:

1.  **Node Sampling**: A Meta-LLM (`ring-2.6-1t`) selects the most relevant experts based on the query and personalized memory.
2.  **Initial Generation**: Selected agents generate parallel independent responses.
3.  **Matrix-Scoring**: Agents cross-evaluate each other. The **Adjacency Variance** is calculated; if consensus is high (variance < 0.15), the system skips refinement to save latency and cost.
4.  **Iterative Refinement**: If needed, high-scoring responses are refined through a bidirectional loop (max 2 iterations) with convergence detection.
5.  **Synthesis (Pooling)**: The final response is synthesized by a premium model (`claude-3.5-sonnet`) and streamed via SSE.

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
- `lib/goa/`: Logic for multi-agent coordination and iterative refinement.
- `lib/openrouter/`: Resilience layer and **Tiered Model Router**.
- `lib/kg/kgCache.ts`: LRU cache for high-speed Knowledge Graph retrieval.
- `lib/utils/telemetry.ts`: Performance monitoring and consensus metrics.
- `lib/design-tokens.ts`: The source of truth for the Cyber-Brutalist design system.

## 5. Resilience Strategy

The system is designed for high reliability:
- **Exponential Backoff**: `chatWithRetry` handles 429 (Rate Limit) errors from OpenRouter free-tier.
- **Error Boundaries**: React Error Boundaries catch rendering failures and provide a graceful recovery UI.
- **Validation**: Zod is used to validate API responses and configuration schemas.
