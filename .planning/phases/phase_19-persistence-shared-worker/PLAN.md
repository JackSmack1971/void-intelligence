# Phase 19: Persistence Layer & Shared Worker - Plan

## Goal
Implement a cross-tab Shared Worker for synchronized state and an IndexedDB layer for offline KG persistence.

## Proposed Changes

### [Infrastructure: Workers]
#### [NEW] [void-worker.js](file:///c:/Users/click/Desktop/New%20project/void-intelligence/public/workers/void-worker.js)
- Implement Shared Worker listener.
- Setup `BroadcastChannel` for tab-to-tab synchronization.
- Manage a shared `in-memory` cache for rapid retrieval.

### [Core: Persistence]
#### [NEW] [idb.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/kg/idb.ts)
- Wrapper for IndexedDB interactions.
- Methods: `saveTripletsLocal`, `getTripletsLocal`, `clearLocal`.

### [Frontend: Hooks]
#### [NEW] [useSharedWorker.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/hooks/useSharedWorker.ts)
- Connect to `void-worker.js`.
- Provide messaging interface and event listeners for React components.

### [Frontend: Components]
#### [MODIFY] [DebateGraph.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/DebateGraph.tsx)
- Listen for `KG_UPDATED` events via `useSharedWorker` and refresh local view if necessary.

## Verification Plan

### Automated Tests
- [ ] **IDB Logic**: Verify triplets can be stored and retrieved from the browser's IndexedDB.
- [ ] **Message Routing**: Mock `BroadcastChannel` and verify events are distributed correctly.

### Manual Verification
- [ ] **Cross-Tab Sync**: Open two browser windows. Trigger an action in one and confirm the other receives the update.
- [ ] **Offline Persistence**: Kill the dev server and verify the graph remains visible in the UI.
