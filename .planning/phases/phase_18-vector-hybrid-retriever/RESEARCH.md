# Phase 18 Research: Vector Infrastructure & Hybrid Retriever

## Objective
Implement a local-first hybrid retrieval system that combines the precision of keyword matching (SQLite) with the conceptual reach of semantic search (Chroma).

## 1. Local Chroma Infrastructure

### Docker Setup
We will use `docker-compose` to run Chroma locally. This ensures no data leaves the user's machine.
- **Service**: `chromadb`
- **Port**: `8000`
- **Volume**: Mapping `./.chroma_data` to `/chroma/chroma` for persistence.

### Client Library
The `chromadb` npm package provides a standard client for Node.js. 
- **Requirement**: The system must handle Chroma being unavailable (e.g., Docker not running) by gracefully falling back to SQLite-only mode.

## 2. Hybrid Retrieval Algorithm

### Data Flow
1. **Extraction**: `GoAOrchestrator` extracts entities/keywords from the query.
2. **Parallel Retrieval**:
    - **Branch A (SQLite)**: Direct `LIKE` or FTS5 matches + 1-hop expansion.
    - **Branch B (Chroma)**: Semantic search based on embeddings of the query.
3. **Merge & Rank**:
    - **Reciprocal Rank Fusion (RRF)**: A standard algorithm for combining results from different retrieval methods.
    - **Fallback**: If Chroma fails, return SQLite results only.

### Implementation: `hybridRetriever.ts`
This new service will orchestrate both data sources. 
- **Embeddings**: We will use the same embedding service (Nomic-based) already researched for the KG, or Chroma's default local embedding function if appropriate.

## 3. Integration Point
The `GoAOrchestrator.retrieveMemory` method will be refactored to call the `HybridRetriever`.

## Verification Plan
- **Infrastructure**: Verify Chroma is reachable via `curl http://localhost:8000`.
- **Retrieval**: Test queries that have semantic overlap but no keyword match (e.g., "regulation" vs "compliance").
- **Performance**: Ensure hybrid retrieval stays under 200ms.
