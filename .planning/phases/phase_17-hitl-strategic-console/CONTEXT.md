# Phase 17: Human-in-the-Loop Strategic Console - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning
**Source:** v1.3 Strategy Specification

<domain>
## Domain Glossary
- **Human-in-the-Loop (HITL)**: A system design where humans can provide feedback or corrections during the automated reasoning process.
- **Debate Intervention**: A manual injection of content into the adversarial debate loop to steer agent reasoning.
- **Strategic Command Dashboard**: A UI panel providing meta-visibility into orchestrator decisions (complexity, routing, waves).

## Phase Boundary
This is the final phase of Milestone v1.3. It bridges the gap between fully autonomous AI and directed human expertise.
</domain>

<decisions>
## Implementation Decisions
- **Persistence**: Interventions will be stored in the `debateLog` with a role of `user-intervention`.
- **UI Interaction**: Use `framer-motion` for smooth context menu and dashboard animations.
- **Resumption**: The backend will support a "Partial Run" mode that skip stages 0-3 if a valid `debateLog` is provided.

### the agent's Discretion
- The layout and contents of the Strategy Dashboard.
- The visual style of "User Intervention" nodes in the graph.
</decisions>

<canonical_refs>
- `void-intelligence/components/DebateGraph.tsx` — Target for context menu implementation.
- `void-intelligence/app/actions.ts` — Target for resumption logic.
</canonical_refs>

---
*Phase: 17-hitl-strategic-console*
*Context gathered: 2026-05-15*
