# Phase 19: Persistence Layer & Shared Worker - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning
**Source:** v1.4 Persistence Specification

<domain>
## Domain Glossary
- **Shared Worker**: A type of web worker that can be accessed by multiple scripts from the same origin, even if they are in different windows or tabs.
- **BroadcastChannel**: An API that allows simple communication between browsing contexts (tabs, windows, workers) on the same origin.
- **IndexedDB (IDB)**: A low-level API for client-side storage of significant amounts of structured data.

## Phase Boundary
This phase focuses on the **synchronization** and **offline persistence** of the graph on the client side. It does not handle multi-device sync (Phase 20) or mobile PWA features (Phase 21).
</domain>

<decisions>
## Implementation Decisions
- **Worker Path**: `/workers/void-worker.js`.
- **Sync Protocol**: `BroadcastChannel` will be the primary bus for tab-to-tab events.
- **Data Mirroring**: Triplet extraction completion will trigger a "Push" from the server (via response) which the client then mirrors to IDB.

### the agent's Discretion
- The exact schema of the IndexedDB store (e.g., adding indices for subject/object).
- The visual feedback for "Offline Mode" in the UI (e.g., a small "Cloud-Off" icon).
</decisions>

<canonical_refs>
- `void-intelligence/lib/kg/kgCache.ts` — Target for Shared Worker extension.
- `void-intelligence/components/DebateGraph.tsx` — Target for sync integration.
</canonical_refs>

---
*Phase: 19-persistence-shared-worker*
*Context gathered: 2026-05-15*
