# Phase 14: Parallel Execution & Dependency Graph - Plan

## Goal
Implement a dependency-aware debate scheduler and shared memory ecosystem to achieve 35% latency reduction and deeper agent harmony.

## Proposed Changes

### [Core: Scheduler]
#### [NEW] [scheduler.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/scheduler.ts)
- Implement `DebateScheduler` class.
- Methods: `computeWaves(graph: AdjacencyMatrix): string[][]` (Kahn's Algorithm).

#### [MODIFY] [engine.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/engine.ts)
- Integrate `DebateScheduler` into `conductDebate`.
- Update `sampleNodes` (or add `strategyStage`) to generate the dependency graph.
- Implement `Shared Memory` injection by passing the full response set to refinement.

### [Core: Prompts]
#### [MODIFY] [prompts.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/prompts.ts)
- Update `REFINEMENT_PROMPT` to include "Global Expert Context".
- Add `SUMMARIZATION_PROMPT` for debate log compression.

### [Core: Types]
#### [MODIFY] [types.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/types.ts)
- Add `dependencyGraph` to `GoAContext`.

## Verification Plan

### Automated Tests
- [ ] **Topological Sort**: Unit tests for `DebateScheduler` to ensure waves respect dependencies.
- [ ] **Wave Execution**: Integration test in `engine.test.ts` to verify waves run in parallel.

### Manual Verification
- [ ] Observe console logs to see "Wave 0", "Wave 1" execution.
- [ ] Verify that final synthesis includes the summarized debate context.
