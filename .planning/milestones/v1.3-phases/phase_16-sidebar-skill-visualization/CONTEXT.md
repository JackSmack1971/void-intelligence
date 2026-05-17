# Phase 16: Sidebar Skill Visualization - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning
**Source:** v1.3 Strategy Specification

<domain>
## Domain Glossary
- **Skill Tree**: A hierarchical visualization of the available agent capabilities, categorized by their domain expertise.
- **Taxonomy Node**: A structural node representing a category (e.g., "Logic") or a specific capability (e.g., "Formal Logic").
- **Agent Node**: A terminal node representing a specific LLM expert.

## Phase Boundary
This phase focuses strictly on the **visualization** of the agent registry. It does not handle debate execution but provides the visual context for *how* agents are selected.
</domain>

<decisions>
## Implementation Decisions
- **Library**: `reactflow` will be used for both the main debate graph and the sidebar skill tree for consistency.
- **Layout Direction**: Top-to-bottom (Vertical) tree to fit the narrow sidebar width.
- **Node Styling**: Agent nodes will be color-coded by their role (meta, logic, extraction, general).

### the agent's Discretion
- The exact color palette for different roles.
- The threshold for "Confidence" badge display.
</decisions>

<canonical_refs>
- `void-intelligence/components/DebateGraph.tsx` — Reference for React Flow usage.
- `void-intelligence/config/models.json` — Source of truth for taxonomy data.
</canonical_refs>

---
*Phase: 16-sidebar-skill-visualization*
*Context gathered: 2026-05-15*
