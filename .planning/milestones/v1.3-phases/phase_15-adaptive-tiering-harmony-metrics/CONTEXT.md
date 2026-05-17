# Phase 15: Adaptive Model Tiering & Harmony Metrics - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning
**Source:** v1.3 Strategy Specification

<domain>
## Domain Glossary
- **Pre-flight Complexity Check**: A high-speed classification of the user query to determine the required expert density and model tier.
- **Mid-flight Pivot (Escalation)**: The process of swapping to a higher-parameter "Heavy" model mid-debate when experts fail to reach a stable consensus.
- **Harmony Score**: A post-facto metric combining convergence speed, stability, and memory integration effectiveness.

## Phase Boundary
This phase introduces the "Brain" of the orchestrator—the logic that decides how much "intelligence" to spend on a query. It is a critical optimization for cost and quality.
</domain>

<decisions>
## Implementation Decisions
- **Heavy Model Tier**: For escalation, we will prioritize `meta-llama/llama-3.3-70b` or `deepseek/deepseek-v4` (high-parameter variants).
- **Harmony Formula**: `(1 - ksStatistic) * 0.4 + (EntropyReduction) * 0.3 + (IterationsInverse) * 0.3`. (Subject to refinement during implementation).
- **Complexity Model**: Use the fastest available model (e.g., `inclusionai/ling-2.6-1t:free`) for the complexity classification to minimize latency impact.

### the agent's Discretion
- The specific mapping of complexity to `k` (number of agents).
- The exact weightings of the Harmony Score components.
</decisions>

<canonical_refs>
- `void-intelligence/lib/goa/engine.ts` — Target for tiering logic.
- `void-intelligence/lib/goa/types.ts` — Target for harmony score metadata.
</canonical_refs>

---
*Phase: 15-adaptive-tiering-harmony-metrics*
*Context gathered: 2026-05-15*
