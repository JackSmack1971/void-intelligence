# Phase 11: Architectural Deepening - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning
**Source:** Architectural Audit & Research

<domain>
## Domain Glossary
- **Graph-of-Agents (GoA)**: The parallel multi-agent reasoning architecture that utilizes specialized experts to solve complex queries.
- **Matrix-Scoring**: The cross-evaluation mechanism where agents rate each other's reasoning to determine relevance and weight.
- **Synthesis (Pooling)**: The final stage where expert perspectives are combined into a cohesive, definitive response.
- **SPO Triplets**: Subject-Predicate-Object knowledge units used for graph persistence (e.g., "AI" "is" "Technology").
- **Pipeline Orchestrator**: The central deep module coordinating the GoA lifecycle stages.
- **Consolidation Agent**: The background maintenance worker responsible for pruning and merging Knowledge Graph triplets.
- **LLM Port/Adapter**: An architectural seam decoupling the reasoning logic from the specific LLM provider (OpenRouter).

## Phase Boundary
This phase focuses on refactoring the core logic into "deep modules" (low surface area, high internal logic) to improve testability and maintainability before adding more features.
</domain>

<decisions>
## Implementation Decisions
- **Port/Adapter Pattern**: We will use a strict Port/Adapter pattern for LLM communication to allow for future provider swaps (e.g., local LLMs).
- **Module Encapsulation**: Internal functions for stage logic (Debate, Scoring) will be hidden from the public API of the `GoAOrchestrator`.
- **KG Unification**: The database and queue logic will be unified into a single `KnowledgeGraph` class to hide implementation details like SQLite or worker queues.

### the agent's Discretion
- Choice of internal data structures for the orchestrator's state management.
- Naming conventions for sub-modules within the `lib/goa/` directory.
</decisions>

<canonical_refs>
## Canonical References
- `void-intelligence/lib/goa/engine.ts` — The current orchestrator implementation (target for refactor).
- `void-intelligence/lib/kg/db.ts` — The current persistence layer.
- `void-intelligence/lib/openrouter/client.ts` — The current LLM client.
</canonical_refs>

<specifics>
## Specific Ideas
- Move `ADVERSARIAL_CRITIQUE_PROMPT` and other prompts into a dedicated `prompts/` sub-directory if they grow too large.
</specifics>

<deferred>
## Deferred Ideas
- Vector database migration (Chroma) is deferred to Phase 14+.
</deferred>

---
*Phase: 11-architectural-deepening*
*Context gathered: 2026-05-15*
