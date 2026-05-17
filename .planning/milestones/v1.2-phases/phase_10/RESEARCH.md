# Phase 10 Research: Knowledge Graph Consolidation

## The Problem: "Additive Bloat"
The current Graph-of-Agents (GoA) engine extracts triplets from every conversation and inserts them into the SQLite database. Since the extraction model (`owl-alpha`) is instruction-driven but stateless, it often:
1.  **Extracts redundant facts**: "Void Intelligence is an AI" vs "Void Intelligence is a coding assistant".
2.  **Creates near-duplicate entities**: "LLM", "Large Language Model", "AI Model".
3.  **Retains stale information**: If a user corrects a previous fact, both the old (wrong) and new (right) facts persist as triplets.

## Proposed Solution: The Consolidation Agent

### 1. Architectural Strategy
We will implement a **Consolidation Worker** that operates on batches of triplets.

**Workflow:**
1.  **Batch Fetch**: Retrieve $N$ recent triplets or triplets related to a specific thread.
2.  **Semantic Synthesis**: Pass the batch to a meta-reasoning model (e.g., `DeepSeek V3` or `Gemini 2.0 Flash`).
3.  **Pragma-Dialectical Cleaning**: The model performs:
    - **Canonicalization**: Mapping "AI" -> "Artificial Intelligence" (or vice versa).
    - **Logical Merging**: `A -> is -> B` and `B -> is -> C` becomes `A -> is -> C` if semantically appropriate, or just deduplicates.
    - **Conflict Detection**: Identifying and resolving contradictory triplets based on timestamp.
4.  **Transactional Swap**: The worker uses a SQL transaction to delete the old triplets and insert the new, consolidated ones.

### 2. Constraints and Thresholds
- **Transactional Safety**: Must use `client.batch` or `BEGIN TRANSACTION` to prevent data loss if the consolidation agent fails or returns invalid JSON.
- **Token Efficiency**: Consolidation should happen sparingly. Suggested trigger: `triplets.length > 100` or after every 5 successful GoA turns.
- **Epistemic Integrity**: The agent must preserve the "Void Topology" (relational structure) while removing "Noise".

## Implementation Roadmap (Preliminary)
- **`lib/kg/consolidation.ts`**: New utility for the consolidation logic.
- **`lib/kg/db.ts`**: Add `replaceTriplets(oldIds, newTriplets)` for atomic updates.
- **`app/actions.ts`**: Add a trigger for consolidation.
- **UI**: Add a status indicator for "Consolidating Knowledge...".
