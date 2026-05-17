# Phase 19 Research: Persistence Layer & Shared Worker

## Objective
Establish a synchronized client-side persistence layer and a cross-tab background worker to ensure intelligence harmony across multiple browser instances.

## 1. Shared Worker Sync (PER-01, PER-03)

### Architectural Role
The `SharedWorker` will act as a "Local Hub" for all open tabs of the Void Intelligence app. 
- **Tab A** extracts a triplet -> Notifies Shared Worker.
- **Shared Worker** broadcasts `KG_UPDATED` to **Tab B** and **Tab C**.
- **Tabs B & C** refresh their local state or visualization.

### Broadcast Mechanism
We will use the `BroadcastChannel` API within the Shared Worker. This is simpler and more robust than manual `MessagePort` management for 1-to-many communication.
- **Channel Name**: `void_kg_sync`
- **Events**: `REFRESH_GRAPH`, `EXTRACT_PENDING`, `SYNC_COMPLETE`.

## 2. IndexedDB Client Persistence (PER-02)

### Why IndexedDB?
While the primary KG is in SQLite (server-side), Milestone v1.4 requires **Offline Reading**. By mirroring the KG to IndexedDB:
1. The app can load the graph instantly without waiting for a server request.
2. The graph can be browsed even if the Next.js dev/prod server is offline.
3. It provides a larger storage quota than `localStorage`.

### Implementation
We will use the `idb` library (minimal wrapper) or raw `IndexedDB` to manage a `triplets` store.
- **Store Name**: `triplets`
- **Key Path**: `id` (subject-predicate-object hash).

## 3. Integration Plan

### Hook: `useSharedWorker`
A custom hook that:
- Connects to the worker at `public/workers/void-worker.js`.
- Listens for broadcast events.
- Provides a `notifyUpdate()` method.

### Mirroring logic
Whenever `storeTriplets` or `consolidateTriplets` completes (server-side), the client will be notified (via the existing SSE or a new response field) to update its local IDB mirror.

## 4. Verification Plan
- **Multi-Tab Sync**: Open two tabs. Modify a triplet in Tab A. Verify Tab B updates automatically.
- **Offline Mode**: Shut down the Next.js server. Refresh the page. Verify the graph still loads from IDB.
- **Shared Worker**: Confirm only one Shared Worker instance is running in Chrome's `chrome://inspect/#workers`.
