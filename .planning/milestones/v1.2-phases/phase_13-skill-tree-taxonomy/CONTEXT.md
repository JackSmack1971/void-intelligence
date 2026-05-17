# Phase 13: Skill-Tree Taxonomy - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning
**Source:** Agentic Architecture Design

<domain>
## Domain Glossary
- **Skill-Tree Taxonomy**: A hierarchical categorization of agent capabilities used to guide the Meta-LLM during node sampling.
- **Taxonomy-Aware Sampling**: The process of first identifying the required skill paths for a query, then selecting agents that provide those skills.
- **Skill Path**: A string representation of a position in the taxonomy (e.g., `Logic/Formal/Syllogisms`).

## Phase Boundary
This phase introduces a structured way to describe and discover agent capabilities. It completes the v1.2 milestone by providing the "Elite" routing mechanism for the consensus pipeline.
</domain>

<decisions>
## Implementation Decisions
- **Hierarchical Paths**: Skills will be defined as slash-separated strings to allow for easy path-based matching (e.g., `startsWith("Logic/")`).
- **Meta-LLM Upgrade**: The sampling prompt will be modified to require the LLM to output the "Required Skill Paths" before the "Selected IDs".
- **Decentralized Tags**: Skill tags will live in `models.json` for each model, while the schema of the tree lives in `taxonomy.json`.

### the agent's Discretion
- The specific depth and breadth of the initial skill tree categories.
- The formatting of the "Required Skill Paths" in the sampling response.
</decisions>

<canonical_refs>
## Canonical References
- `void-intelligence/config/models.json` — Target for skill tagging.
- `void-intelligence/lib/goa/prompts.ts` — Target for sampling prompt upgrade.
</canonical_refs>

---
*Phase: 13-skill-tree-taxonomy*
*Context gathered: 2026-05-15*
