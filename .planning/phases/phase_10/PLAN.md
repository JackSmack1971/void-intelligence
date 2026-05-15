# Phase 10: Knowledge Graph Consolidation

## Goal
Implement an asynchronous background worker to prune, merge, and deduplicate the Knowledge Graph (KG), resolving the "additive bloat" issue through transactional semantic consolidation.

## Proposed Changes

### [KG Engine]
#### [NEW] [consolidation.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/kg/consolidation.ts)
- Implement `runConsolidation(triplets: Triplet[])`:
    - Uses `DeepSeek V3` to semantically merge and canonicalize triplets.
    - Resolves conflicts and removes redundant "noise".
- Implement `triggerConsolidation()`:
    - Checks `triplets` count and triggers if threshold (>100) is reached.

#### [MODIFY] [db.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/kg/db.ts)
- Add `consolidateTriplets(oldIds: number[], newTriplets: Triplet[])`:
    - Wraps the deletion of old records and insertion of new records in a single ACID batch.
- Add `getConsolidationBatch(limit: number)`:
    - Fetches the oldest $N$ triplets for processing.

### [Orchestration]
#### [MODIFY] [queue.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/kg/queue.ts)
- Update the worker to check for consolidation needs after every successful extraction.

### [UI Components]
#### [MODIFY] [app/page.tsx](file:///c:/Users/click/Desktop/New%20project/void-intelligence/app/page.tsx)
- Add a "Consolidating Knowledge..." status indicator (similar to the extraction sync).

## Verification Plan

### Automated Tests
- Create `consolidation.test.ts`:
    - Mock a set of redundant triplets (e.g., "AI is tech", "Artificial Intelligence is technology").
    - Verify that the consolidation agent successfully reduces them to a single canonical triplet.
    - Verify transactional integrity (database state remains consistent even if the LLM returns junk).

### Manual Verification
- Observe the `triplets` table in SQLite before and after a consolidation run.
- Ensure the Knowledge Graph visualization in the UI remains coherent and doesn't "shatter" after consolidation.
