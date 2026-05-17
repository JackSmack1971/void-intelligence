# Phase 20: Collaborative Sync (Import/Export) - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning
**Source:** Milestone v1.4 Collaboration Spec

<domain>
## Domain Glossary
- **Trail**: A packaged segment of the knowledge graph and associated conversation history.
- **.void File**: The proprietary, encrypted file format used for intelligence exchange.
- **Visual Diff**: The process of comparing incoming data with the local database to identify changes and conflicts.

## Phase Boundary
This phase introduces **asynchronous collaboration**. It does not implement real-time multi-user editing (WebSockets), as the "Absolute Darkness" philosophy prioritizes offline-first, manual sync.
</domain>

<decisions>
## Implementation Decisions
- **Passphrase-Only**: No usernames or accounts. The passphrase *is* the key to the trail.
- **Local-Only Encryption**: Plaintext data never touches the network or server logs; encryption happens entirely in the browser.
- **Selective Import**: Users can choose which triplets to "Accept" into their local void.

### the agent's Discretion
- The aesthetic of the `.void` file icon or preview in the UI.
- The default "Merge Mode" (e.g., auto-accepting exact matches vs asking for everything).
</decisions>

<canonical_refs>
- `void-intelligence/lib/kg/idb.ts` — Source/Target for local data.
- `void-intelligence/lib/kg/consolidation.ts` — Reference for deduplication logic.
</canonical_refs>

---
*Phase: 20-collaborative-sync*
*Context gathered: 2026-05-15*
