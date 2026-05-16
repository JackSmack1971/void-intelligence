# Phase 15 Research: Adaptive Model Tiering & Harmony Metrics

## Objective
Implement dynamic model escalation and post-debate health scoring to optimize cost vs. intelligence.

## 1. Adaptive Model Tiering

### Pre-flight Complexity Judge
Before selecting agents, the Meta-LLM should perform a "Complexity Audit":
- **Query Complexity**:
    - **Low**: Simple factual recall or extraction.
    - **Medium**: Multi-hop reasoning or creative synthesis.
    - **High**: Formal logic, math, or contradictory expert domains.
- **Action**: Map complexity to `k` (agent count) and `ModelTier` (selection of models from `models.json`).

### Mid-flight Pivot (Escalation)
If the debate remains unstable (`ksStatistic` high) after 2 rounds:
- **Pivot**: Force the next refinement or the final synthesis to use a **Heavy Tier** model (e.g., Llama-3.3-70B or Qwen3-235B) regardless of initial sampling.
- **Rationale**: High divergence indicates the current expert pool is struggling; a higher-parameter "mediator" is needed to resolve the deadlock.

## 2. Harmony Metrics

### The Harmony Score
A composite metric to measure the effectiveness of the consensus:
- **Formula**: `Harmony = (Stability * 0.4) + (EntropyReduction * 0.3) + (KG_Consolidation_Delta * 0.3)`
- **Stability**: `1 - ksStatistic`.
- **EntropyReduction**: How much uncertainty was removed across rounds.
- **KG Delta**: The ratio of new facts ingested vs. existing facts refined.

## Technical Strategy
- **Sampling Update**: Update `GoAOrchestrator.run` to include a complexity classification call.
- **Debate Loop Update**: Add a conditional "Escalation" check before the final round.
- **Result Object**: Add `harmonyScore: number` to `GoAResult`.

## Verification Plan
- **Automated**: Verify that a "High" complexity query triggers the escalation path in tests.
- **Metrics**: Verify the calculation of the Harmony Score in the final result.
