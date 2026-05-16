# Phase 15: Adaptive Model Tiering & Harmony Metrics - Plan

## Goal
Implement dynamic model escalation and post-debate health scoring to optimize cost vs. intelligence.

## Proposed Changes

### [Core: GoA Engine]
#### [MODIFY] [engine.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/engine.ts)
- Update `run` to include a `classifyComplexity` stage before sampling.
- Modify `sampleNodes` to take `complexity` into account.
- Modify `conductDebate` to support "Mid-flight Pivot" (escalation to heavy models on stall).
- Implement `calculateHarmonyScore` method.

#### [MODIFY] [types.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/types.ts)
- Add `harmonyScore?: number` to `GoAResult`.
- Add `complexity?: "low" | "medium" | "high"` to `GoAContext`.

### [Core: Prompts]
#### [MODIFY] [prompts.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/prompts.ts)
- Add `COMPLEXITY_CLASSIFICATION_PROMPT`.
- Update `NODE_SAMPLING_PROMPT` to prioritize model tiers based on complexity.

## Verification Plan

### Automated Tests
- [ ] **Escalation Trigger**: Unit test to verify that unstable debates trigger the heavy model pivot.
- [ ] **Complexity Mapping**: Verify that "high" complexity query results in a larger `k` or heavier agents.
- [ ] **Harmony Score**: Verify score calculation logic.

### Manual Verification
- [ ] Inspect console logs for "Escalating to heavy model due to low convergence".
- [ ] Verify Harmony Score appears in the chat UI result object.
