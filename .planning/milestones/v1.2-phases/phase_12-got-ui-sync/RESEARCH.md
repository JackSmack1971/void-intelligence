# Phase 12 Research: Graph-of-Thoughts & UI Sync

## Objective
Visualize the "hidden" multi-turn adversarial debate and provide real-time feedback on the consensus process.

## Visualization Strategy: Debate Graph

### Component: DebateGraph.tsx
- **Library**: `reactflow` (already used in `KnowledgeGraph.tsx`).
- **Data Source**: The `debateLog` returned by `GoAOrchestrator.run()`.
- **Structure**:
    - **Nodes**: Each agent in the debate (Agent 1, Agent 2, etc.) and a "Semantic Judge" node.
    - **Edges**: Critique/Refinement relationships between agents across turns.
    - **Visual Style**: Dark mode, neon accents (blue for generation, purple for critique, green for consensus).

## Real-time Telemetry: Consensus Progress

### Current State
- The UI shows metrics *after* the response is finished.
- The `currentStatus` state only shows text (e.g., "Initializing Graph-of-Agents...").

### Target
- **Streaming Status**: Use the `onStatus` callback in `GoAOrchestrator` to update a more granular progress indicator.
- **Stability Meter**: A radial or linear gauge showing the `1 - ksStatistic` (Stability) in real-time as rounds progress.

## Implementation Details

### API Update
- Ensure `processChat` action (in `app/actions.ts`) correctly propagates the `debateLog` to the frontend.

### Component Architecture
- `DebateGraphPanel`: A collapsible panel inside the assistant message bubble that renders the `DebateGraph` when expanded.
- `TelemetryPanel`: A dedicated UI area (possibly a sidebar or header) showing the current GoA pipeline state.

## Verification Plan
- **Manual**: Verify that clicking "View Debate" on a finished message opens a React Flow graph showing the critique trail.
- **Manual**: Verify that the "Stability" percentage updates across debate rounds in the status area.
