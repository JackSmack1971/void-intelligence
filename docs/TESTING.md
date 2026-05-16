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

## 5. Writing New Tests

- **Unit Tests**: Create a file named `*.test.ts` adjacent to the file being tested. Use Vitest `describe` and `it` blocks.
- **Mocking**: Use `vi.mock()` to mock external dependencies like the `LLMProvider` or `KnowledgeGraph`.
- **E2E Tests**: Add new specs to the `tests/` directory. Use the Page Object model for complex interactions.

## 6. Coverage Requirements

We aim for high coverage in core engine logic:
| Area | Target Coverage |
| :--- | :--- |
| `lib/goa/` | 90%+ |
| `lib/kg/` | 85%+ |
| `lib/utils/` | 95%+ |

Run coverage report with:
```bash
npm run test:coverage
```

## 7. CI Integration

Testing is automated via **GitHub Actions**:
- **Workflow**: `.github/workflows/test.yml`
- **Trigger**: Every push to `main` and all Pull Requests.
- **Steps**:
  1. Linting (`npm run lint`)
  2. Unit Tests (`npm run test`)
  3. Build (`npm run build`)
