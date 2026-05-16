# Phase 11 Research: Architectural Deepening

## Deepening Candidates

### 1. GoA Pipeline Orchestrator
**Current State:** The 5-stage pipeline (Sampling → Parallel Generation → Matrix-Scoring → Refinement → Synthesis/Pooling) is co-located in `engine.ts`.
**Target:** A deep **Pipeline Orchestrator** module with a narrow interface.
**Action:**
- Move stage-specific logic (e.g., scoring math, debate loop) into internal functions or sub-modules.
- Define a strict `GoAPipelineResult` interface.
- Decouple prompt selection from stage logic.

### 2. LLM Provider Port (OpenRouter)
**Current State:** `chatWithRetry` is used directly in `engine.ts`, leaking transport concerns.
**Target:** An **LLM Port** interface with a production **OpenRouter Adapter**.
**Action:**
- Create `lib/ports/llm.ts` defining the interface.
- Implement `lib/adapters/openrouter.ts`.
- Inject the adapter into the orchestrator.

### 3. Knowledge Graph Lifecycle
**Current State:** Extraction, persistence, and caching are separate but coordination is implicit.
**Target:** A consolidated **KnowledgeGraph** module.
**Action:**
- Expose a single `ingest()` entry point.
- Hide `ExtractionQueue` and `libsql` details behind the seam.
- Centralize invariant enforcement (e.g., SPO triplet schema).

## Domain Glossary (Initial CONTEXT.md)
We will lazily initialize `CONTEXT.md` with:
- **Graph-of-Agents (GoA)**: The multi-agent reasoning architecture.
- **Matrix-Scoring**: The cross-evaluation mechanism.
- **Synthesis (Pooling)**: The final response generation.
- **SPO Triplets**: Subject-Predicate-Object knowledge units.
- **Pipeline Orchestrator**: The central coordination module.
- **Consolidation Agent**: The KG maintenance worker.
