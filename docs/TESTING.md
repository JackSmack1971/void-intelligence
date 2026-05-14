# Testing Strategy

Void Intelligence employs a multi-layered testing approach to ensure engine reliability and UI stability.

## 1. Unit Testing (Vitest)

We use **Vitest** for fast, isolated tests of core logic.

### Running Unit Tests
```bash
npm run test
```

### Core Test Suites
- `lib/goa/engine.test.ts`: Verifies the 5-stage orchestration flow and scoring logic.
- `lib/utils/redaction.test.ts`: Validates PII masking priority and restoration integrity.
- `lib/kg/extraction.test.ts`: Tests the parsing of triplet data from Owl Alpha responses.
- `lib/kg/db.test.ts`: Verifies SQLite schema initialization and persistence.
- `lib/openrouter/client.test.ts`: Tests retry logic, exponential backoff, and SSE token streaming.

## 2. Component Testing (React Testing Library)

Component tests verify that individual UI elements render correctly and handle errors gracefully.

- `components/ErrorBoundary.test.tsx`: Simulates application crashes to verify the "Something went wrong" fallback UI.

## 3. End-to-End Testing (Playwright)

Playwright is used for full-system integration tests.

### Running E2E Tests
```bash
npx playwright test
```

### Key Scenarios
- **Chat Loop**: Verify user input generates a streamed response.
- **KG Viz**: Verify the Knowledge Graph renders nodes after a conversation.
- **Redaction Verification**: Verify that PII is masked in the network payload (simulated).

## 4. Manual Verification (UAT)

For UI polish and responsiveness:
- Verify mobile responsiveness on breakpoints (< 768px).
- Verify dark mode contrast and readability.
- Verify "Reasoning Log" timing and animations.
