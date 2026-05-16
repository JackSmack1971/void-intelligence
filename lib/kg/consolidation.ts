import { chatWithRetry } from "../openrouter/client";
import { KnowledgeTriplet as Triplet } from "../goa/types";
import { getConsolidationBatch, consolidateTriplets } from "./db";

const CONSOLIDATION_MODEL = "deepseek/deepseek-chat:free";

export const CONSOLIDATION_PROMPT = (triplets: Triplet[]) => `
### SYSTEM ROLE
You are a Knowledge Graph Consolidation Agent. Your goal is to prune, deduplicate, and canonicalize semantic triplets to maintain a sparse, high-fidelity graph.

### RAW TRIPLETS
${JSON.parse(JSON.stringify(triplets, null, 2))}

### CONSOLIDATION RULES
1. [Entity Resolution]: Merge subjects/objects referring to the same concept (e.g., "AI" and "Artificial Intelligence") into a single canonical form.
2. [Deduplication]: Remove redundant or identical triplets. Keep the most descriptive predicate.
3. [Conflict Resolution]: Prioritize the most general or factually accurate claim if contradictions exist.
4. [Sparsity]: Ensure the resulting set is lean but retains all unique semantic information.

### OUTPUT SCHEMA
Return ONLY a raw JSON object:
{
  "consolidated": [
    { "subject": "string", "predicate": "string", "object": "string" }
  ]
}
`;

/**
 * Runs a consolidation pass on the Knowledge Graph.
 */
export async function runConsolidation() {
  console.log("[KG] Starting knowledge consolidation pass...");
  
  // 1. Fetch a batch of oldest triplets
  const batch = await getConsolidationBatch(50);
  if (batch.length < 10) {
    console.log("[KG] Insufficient triplets for consolidation (< 10). Skipping.");
    return;
  }

  // 2. Semantically consolidate via LLM
  try {
    const response = await chatWithRetry(
      [{ role: "user", content: CONSOLIDATION_PROMPT(batch) }],
      { model: CONSOLIDATION_MODEL, json_mode: true }
    );

    const { consolidated } = JSON.parse(response);
    
    // 3. Integrity Safeguard [BEH-3]
    if (!consolidated || !Array.isArray(consolidated) || consolidated.length === 0) {
      console.warn("[KG] LLM returned empty consolidation result. Aborting batch swap to prevent data loss.");
      return;
    }

    const newTriplets = consolidated as Triplet[];

    // 4. Atomicly swap in the database
    const oldIds = batch.map(b => b.id);
    await consolidateTriplets(oldIds, newTriplets);
    
    console.log(`[KG] Consolidation complete: ${oldIds.length} -> ${newTriplets.length} triplets.`);
  } catch (error) {
    console.error("[KG] Consolidation failed:", error);
  }
}
