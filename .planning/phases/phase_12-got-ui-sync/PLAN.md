# Phase 12: Graph-of-Thoughts & UI Sync - Plan

## Goal
Visualize the adversarial debate process and provide real-time consensus telemetry in the UI to improve transparency and trust in the GoA pipeline.

## Proposed Changes

### [UI: Components]
#### [NEW] [DebateGraph.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/DebateGraph.tsx)
- Create a `reactflow` based component to render the `debateLog`.
- Implement automatic layouting for multi-turn exchange visualization.

#### [MODIFY] [page.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/app/page.tsx)
- Add a "View Debate" button to assistant messages.
- Integrate the `DebateGraph` into a collapsible section.
- Enhance the `currentStatus` display to show stability metrics during the debate loop.

### [API: Actions]
#### [MODIFY] [actions.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/app/actions.ts)
- Ensure `GoAResult` with `debateLog` is correctly serialized and returned to the client.

## Verification Plan

### Automated Tests
- [ ] Add basic unit tests for `DebateGraph` node/edge generation logic.

### Manual Verification
- [ ] **Debate Visualization**: Trigger a complex query that forces multiple debate rounds and verify the graph correctly shows the critique trail.
- [ ] **Real-time Metrics**: Observe the "Stability" percentage updating in the status indicator during the debate rounds.
- [ ] **UI Responsiveness**: Ensure the React Flow graph does not negatively impact page performance.
