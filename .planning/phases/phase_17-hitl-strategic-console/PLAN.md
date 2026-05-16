# Phase 17: Human-in-the-Loop Strategic Console - Plan

## Goal
Transform the UI into a command center with HITL interventions and a strategy dashboard.

## Proposed Changes

### [Frontend: Debate Graph]
#### [MODIFY] [DebateGraph.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/DebateGraph.tsx)
- Implement `onNodeContextMenu` to show a custom `InterventionMenu`.
- Add `Manual Critique` modal/input.
- Add `Redirect Agent` capability.

### [Frontend: Strategy Dashboard]
#### [NEW] [StrategyDashboard.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/StrategyDashboard.tsx)
- Create a panel to display complexity, waves, and harmony scores.
- Integrate into the `Sidebar` or a floating `Panel`.

### [Backend: Actions]
#### [MODIFY] [actions.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/app/actions.ts)
- Update `processChat` to handle interventions.
- Implement logic to resume `GoAOrchestrator` from a specific debate state.

### [Core: Engine]
#### [MODIFY] [engine.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/engine.ts)
- Support `resumeDebate(debateLog, intervention)` method.

## Verification Plan

### Manual Verification
- [ ] **Context Menu**: Verify right-click on an agent node opens the menu.
- [ ] **Critique Injection**: Manually add a critique and verify the orchestrator responds to it in a new round.
- [ ] **Dashboard Accuracy**: Verify the "High Complexity" and "Harmony: 92%" labels match the backend logs.
