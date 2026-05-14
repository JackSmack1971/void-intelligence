# API & Engine Reference

Void Intelligence is primarily a server-side engine interacted with via Next.js Server Actions.

## Server Actions (`app/actions.ts`)

### `processChat(query: string)`
The primary entry point for chat requests.

- **Parameters**: `query` (string)
- **Returns**: `Promise<{ success: boolean; data?: GoAResult; error?: string }>`
- **Behavior**:
    - Initializes the `runGoA` engine.
    - Triggers background triplet extraction.
    - Stores the conversation in SQLite.

## GoA Engine (`lib/goa/engine.ts`)

### `runGoA(query: string, options?: GoAOptions)`
Orchestrates the multi-agent reasoning graph.

- **Options**:
    - `onStatus`: `(status: string) => void` (Callback for pipeline stage updates)
    - `onToken`: `(token: string) => void` (Callback for real-time synthesis streaming)

### `GoAResult` Interface
```typescript
interface GoAResult {
  finalResponse: string;
  reasoningSteps: string[];
  tripletsExtracted: number;
}
```

## OpenRouter Client (`lib/openrouter/client.ts`)

### `chatWithRetry(messages, config)`
Standard chat completion with exponential backoff for rate limits.

### `streamChat(messages, config, onToken)`
Low-level SSE streaming implementation.
- **SSE Parsing**: Handles `data: {...}` chunks and `[DONE]` signals.
- **Chunk Buffer**: Accumulates tokens to prevent malformed multi-byte character breaks.

## Knowledge Graph (`lib/kg/extraction.ts`)

### `extractTriplets(text: string)`
Analyzes text and returns semantic triplets.

- **Returns**: `Promise<Triplet[]>`
- **Triplet Format**:
    ```typescript
    {
      subject: string;
      predicate: string;
      object: string;
    }
    ```
