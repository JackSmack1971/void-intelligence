<!-- generated-by: gsd-doc-writer -->
# Knowledge Graph Documentation

Void Intelligence builds a persistent, private Knowledge Graph (KG) of your intelligence trails, stored locally and processed with high integrity.

## Architecture

The Knowledge Graph system follows a modular architecture for ingestion, extraction, and retrieval:

### 1. Ingestion & Queue (`lib/kg/queue.ts`)
Transcripts are not processed synchronously to avoid blocking the main chat thread.
- **`ingestTranscript`**: Enqueues new chat segments for background processing.
- **Debouncing**: Multiple rapid messages are batched to reduce model calls.

### 2. Extraction (`lib/kg/extraction.ts`)
The `Owl Alpha` model parses transcripts into **Subject-Predicate-Object (SPO)** triplets.
- **Schema Enforcement**: Ensures extracted triplets match a strictly validated interface.
- **Entity Identification**: Detects names, concepts, and relationships.

### 3. Consolidation (`lib/kg/consolidation.ts`)
A background refinement task that maintains graph sparsity and semantic integrity.
- **Canonicalization**: Merges synonymous entities (e.g., "AI" -> "Artificial Intelligence").
- **Pruning**: Removes redundant or low-value relationships to prevent graph bloat.

### 4. Hybrid Retrieval (`lib/kg/hybridRetriever.ts`)
Combines multiple search strategies for maximum relevance:
- **Keyword Search**: Traditional SQLite matching on entities and predicates.
- **Vector Search**: Semantic expansion via local **ChromaDB** integration.
- **RRF (Reciprocal Rank Fusion)**: Merges keyword and vector results for optimal ranking.

### 5. Persistence (`lib/kg/db.ts`)
Stores all data in a local SQLite database (`void-intelligence.db`).
- **Tables**: `triplets` (graph), `messages` (history), `sync_state` (cross-tab sync).
- **Client**: `libsql` for transactional safety and high concurrency.

## Cross-Tab Synchronization

Located in `lib/kg/sync.ts`, the system ensures that the graph remains consistent across multiple browser tabs using:
- **Shared Workers**: Centralized state management in the browser.
- **BroadcastChannel API**: Real-time event propagation.
- **IndexedDB**: Local mirroring for offline-first graph interaction.

## Visualization

The front-end renders the graph using **React Flow**, allowing users to:
- Browse entity clusters.
- Surgically delete (prune) specific relationships.
- Search for nodes using semantic filters.
