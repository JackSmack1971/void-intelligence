# Phase 17 Research: HITL Strategic Console

## Objective
Transform the UI into a "Strategic Command Center" by enabling human-in-the-loop (HITL) interventions and real-time strategy visualization.

## 1. Human-in-the-Loop Interventions

### Node Context Menu
- **Trigger**: `onNodeContextMenu` in React Flow.
- **Actions**:
    - **Add Manual Critique**: Injects a user-authored critique into the `debateLog`.
    - **Redirect Agent**: Swaps the model tier for a specific agent for the next refinement round.
    - **Force Redebate**: Restarts the debate from the current round with new constraints.

### Execution Flow
1. User interacts with a node in `DebateGraph`.
2. Frontend updates the stateful `debateLog`.
3. Frontend triggers a `re-refine` action, passing the current `debateLog` + `intervention`.
4. Orchestrator skips initial stages and jumps directly to `conductDebate` with the existing log.

## 2. Strategy Dashboard

### Components
- **Wave Visualization**: Display the topological waves computed by the `DebateScheduler`.
- **Complexity Badge**: Show the "Low/Medium/High" classification from the pre-flight stage.
- **Harmony Telemetry**: Live chart of stability vs. iterations.

### Integration
- **Panel**: Use `React Flow Panel` or a new Sidebar tab (`Capabilities` -> `Strategy`).

## 3. Technical Strategy
- **Actions Update**: `actions.ts` needs to support "continuation" or "intervention" modes.
- **UI State**: `app/page.tsx` needs to manage the `isIntervening` state.

## Verification Plan
- **Manual**: Verify that a manual critique injected into the graph correctly alters the next turn's response.
- **Visual**: Verify that the Strategy Dashboard correctly displays the complexity and harmony scores.
