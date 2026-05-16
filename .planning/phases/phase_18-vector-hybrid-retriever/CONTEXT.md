# Phase 18: Vector Infrastructure & Hybrid Retriever - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning
**Source:** v1.4 Strategy Specification

<domain>
## Domain Glossary
- **Hybrid Retrieval**: Combining keyword (BM25) and semantic (Dense) search for better recall.
- **RRF (Reciprocal Rank Fusion)**: A merging algorithm that rewards items appearing at the top of multiple search result lists.
- **Local Chroma**: An open-source vector database deployed via Docker.

## Phase Boundary
This phase focuses on the **retrieval** path. While we will implement `upsert` logic for triplets, the main goal is enhancing the `retrieveMemory` stage of the GoA orchestrator.
</domain>

<decisions>
## Implementation Decisions
- **Portability**: Chroma will run on port `8000`.
- **Ranking**: We will use a simplified RRF with a constant `k=60` for merging SQLite and Chroma results.
- **Embeddings**: We will leverage the `Nomic` embedding model via OpenRouter/Ollama if available, or fall back to Chroma's default internal embeddings for the prototype.

### the agent's Discretion
- The exact scoring weights for SQLite vs Chroma results.
- The UI representation of "Semantic Matches" in the telemetry (if any).
</decisions>

<canonical_refs>
- `void-intelligence/lib/kg/db.ts` — Existing SQLite retrieval logic.
- `void-intelligence/lib/goa/engine.ts` — Integration point for retrieval.
</canonical_refs>

---
*Phase: 18-vector-hybrid-retriever*
*Context gathered: 2026-05-15*
