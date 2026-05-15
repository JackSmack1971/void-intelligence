import { chatWithRetry } from "../openrouter/client";
import { Triplet } from "./extraction";
import { getConsolidationBatch, consolidateTriplets } from "./db";

const CONSOLIDATION_MODEL = "deepseek/deepseek-chat:free";

export const CONSOLIDATION_PROMPT = (triplets: Triplet[]) => `
You are a Knowledge Graph Consolidation Agent. Your task is to prune, deduplicate, and canonicalize a set of semantic triplets.

Raw Triplets:
${JSON.parse(JSON.stringify(triplets, null, 2))}

Requirements:
1. Entity Resolution: Identify subjects/objects that refer to the same concept (e.g., "AI" and "Artificial Intelligence") and use a single canonical form.
2. Deduplication: Remove identical triplets or those that are strictly redundant (e.g., if you have "X is Y" and "X defined_as Y", keep the most descriptive one).
3. Conflict Resolution: If facts contradict, choose the most likely correct or general one.
4. Information Density: Ensure the resulting graph is sparse but high-fidelity.

Respond ONLY with a JSON object in this format:
{
  "consolidated": [
    { "subject": "Canonical Subject", "predicate": "concise_predicate", "object": "Canonical Object" },
    ...
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
    const newTriplets = consolidated as Triplet[];

    // 3. Atomicly swap in the database
    const oldIds = batch.map(b => b.id);
    await consolidateTriplets(oldIds, newTriplets);
    
    console.log(`[KG] Consolidation complete: ${oldIds.length} -> ${newTriplets.length} triplets.`);
  } catch (error) {
    console.error("[KG] Consolidation failed:", error);
  }
}
