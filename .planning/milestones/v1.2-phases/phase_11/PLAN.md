# Phase 11: Architectural Deepening

## Goal
Transform shallow modules into deep modules with stable interfaces to improve locality, leverage, and testability across the GoA reasoning engine and Knowledge Graph lifecycle.

## User Review Required
> [!IMPORTANT]
> This phase involves significant refactoring of core files (`engine.ts`, `db.ts`, `queue.ts`). While the behavior should remain identical, the file structure and internal interfaces will change.

## Proposed Changes

### [Core: GoA Pipeline]
#### [MODIFY] [engine.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/engine.ts)
- Refactor into a deep **Pipeline Orchestrator**.
- Encapsulate stages (Sampling, Debate, Synthesis) into private internal functions or sub-modules.
- Expose a single `orchestrate(query, models)` interface.

#### [NEW] [llm.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/ports/llm.ts)
- Define the `LLMProvider` interface (Port).

#### [NEW] [openrouter.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/adapters/openrouter.ts)
- Implement the `OpenRouterAdapter` (Adapter).

### [Core: Knowledge Graph]
#### [MODIFY] [db.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/kg/db.ts) / [queue.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/kg/queue.ts)
- Consolidate into a unified **KnowledgeGraph** lifecycle module.
- Hide `ExtractionQueue` from external callers; expose `ingestTranscript`.

### [Documentation]
#### [NEW] [CONTEXT.md](file:///c:/Users/click/Desktop/New%20project/void-intelligence/CONTEXT.md)
- Initialize the domain glossary with core terms (GoA, Matrix-Scoring, SPO Triplets, etc.).

## Verification Plan

### Automated Tests
- **Unit Tests**:
    - Update `engine.test.ts` to test through the new deep orchestrator interface.
    - Create `llm.test.ts` with a mock adapter to verify provider-agnosticism.
- **Regression**:
    - Ensure `npm test` still passes for all existing logic.

### Manual Verification
- [ ] Verify that chat interactions still function correctly in the UI.
- [ ] Verify that background KG extraction and consolidation still trigger as expected.
