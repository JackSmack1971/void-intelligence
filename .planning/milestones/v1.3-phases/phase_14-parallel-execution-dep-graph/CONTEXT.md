# Phase 14: Parallel Execution & Dependency Graph - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning
**Source:** v1.3 Strategy Specification

<domain>
## Domain Glossary
- **Debate Scheduler**: The module responsible for organizing agents into execution waves based on their critique relationships.
- **Topological Wave**: A set of agents who can perform their tasks in parallel because they have no mutual dependencies or their dependencies have already been satisfied.
- **Shared Agent Memory**: An upgraded context injection strategy where experts are aware of the global pool of responses, not just their immediate peers.

## Phase Boundary
This phase transitions the GoA engine from a simple ring-buffer debate into a complex, scheduled graph execution system. It is the first step in the v1.3 "Harmony" milestone.
</domain>

<decisions>
## Implementation Decisions
- **Scheduler Algorithm**: Kahn's algorithm will be used for topological sorting of the dependency graph.
- **Concurrency Model**: `Promise.all` will be used per wave to maximize IO throughput.
- **Memory Injection**: Peer context will be summarized using a "Flash" model to prevent context window overflow while maintaining "harmony".

### the agent's Discretion
- The exact format of the dependency graph returned by the Meta-LLM.
- The threshold for "Prompt Compression" activation.
</decisions>

<canonical_refs>
- `void-intelligence/lib/goa/engine.ts` — Target for scheduler integration.
- `void-intelligence/lib/goa/prompts.ts` — Target for refinement and compression prompts.
</canonical_refs>

---
*Phase: 14-parallel-execution-dep-graph*
*Context gathered: 2026-05-15*
