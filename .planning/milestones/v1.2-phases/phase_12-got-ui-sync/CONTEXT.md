# Phase 12: Graph-of-Thoughts & UI Sync - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning
**Source:** UI/UX Research

<domain>
## Domain Glossary
- **Graph-of-Thoughts (GoT)**: The visual representation of the multi-turn reasoning process, specifically the adversarial exchange between agents.
- **Consensus Telemetry**: Real-time data streams (stability, entropy, iteration count) provided to the user during long-running reasoning tasks.
- **Reasoning Trail**: The historical record of how a final answer was synthesized.

## Phase Boundary
This phase focuses on the frontend presentation of the GoA engine's internal state. It does not modify the core reasoning logic but requires better state exposure from the backend/API.
</domain>

<decisions>
## Implementation Decisions
- **React Flow**: We will use `reactflow` for the debate graph to maintain consistency with the Knowledge Graph visualization.
- **Collapsible Disclosure**: The debate graph will be hidden by default to keep the chat clean, accessible via a "View Reasoning" or "View Debate" trigger.
- **Streaming Telemetry**: We will use the `currentStatus` string to relay stability metrics during the debate rounds to give the user a sense of "convergence".

### the agent's Discretion
- Exact layout algorithm for the debate nodes (circular vs. layered).
- Color palette for critique edges (e.g., shades of red/orange for "attacks").
</decisions>

<canonical_refs>
## Canonical References
- `void-intelligence/components/KnowledgeGraph.tsx` — Reference for React Flow implementation.
- `void-intelligence/app/page.tsx` — Main chat UI for integration.
- `void-intelligence/lib/goa/engine.ts` — Source of `debateLog` and `metrics`.
</canonical_refs>

---
*Phase: 12-got-ui-sync*
*Context gathered: 2026-05-15*
