# Phase 18: Vector Infrastructure & Hybrid Retriever - Plan

## Goal
Deploy local Chroma infrastructure and implement a hybrid retrieval service to enhance memory recall.

## Proposed Changes

### [Infrastructure]
#### [NEW] [docker-compose.yml](file:///c:/Users/click/Desktop/New%20project/void-intelligence/docker-compose.yml)
- Define `chromadb` service.
- Persistence volume mapping.

### [Core: Vector Store]
#### [NEW] [chroma.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/kg/chroma.ts)
- Wrapper for `chromadb` client.
- Methods: `upsertTriplets`, `querySemantic`.
- Graceful error handling for connection issues.

### [Core: Retrieval]
#### [NEW] [hybridRetriever.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/kg/hybridRetriever.ts)
- Orchestrates `db.ts` (SQLite) and `chroma.ts` (Vector).
- Implements RRF (Reciprocal Rank Fusion) for merging results.

### [Core: Orchestrator]
#### [MODIFY] [engine.ts](file:///c:/Users/click/Desktop/New%20project/void-intelligence/lib/goa/engine.ts)
- Update `retrieveMemory` to use the `HybridRetriever`.

## Verification Plan

### Automated Tests
- [ ] **RRF Logic**: Unit test for the ranking algorithm.
- [ ] **Chroma Fallback**: Verify that retrieval still works if Chroma is offline.

### Manual Verification
- [ ] **Docker Check**: Confirm `docker-compose up -d` starts Chroma successfully.
- [ ] **Semantic Test**: Query for synonyms (e.g., "AI" vs "Machine Learning") and confirm relevant triplets are retrieved.
