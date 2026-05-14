import { chatWithRetry, streamChat } from "../openrouter/client";
import { ModelCard, GoAContext, AdjacencyMatrix, GoAResult, AgentResponse } from "./types";
import {
  NODE_SAMPLING_PROMPT,
  RELEVANCE_SCORING_PROMPT,
  REFINEMENT_PROMPT,
  POOLING_SYNTHESIS_PROMPT
} from "./prompts";
import { extractTriplets } from "../kg/extraction";
import { storeTriplets, getRelevantMemory } from "../kg/db";

const META_MODEL = "inclusionai/ring-2.6-1t:free";

/**
 * Stage 0: Memory Retrieval
 */
async function extractKeywords(query: string): Promise<string[]> {
  try {
    const prompt = `User Query: "${query}"\nExtract 3-5 core entities or search keywords for a database search. Respond ONLY with a comma-separated list.`;
    const response = await chatWithRetry([{ role: "user", content: prompt }], { model: META_MODEL });
    return response.split(",").map(k => k.trim()).filter(Boolean);
  } catch (err) {
    console.error("[GoA] Keyword extraction failed:", err);
    return [];
  }
}

export async function runGoA(
  query: string,
  allCards: ModelCard[],
  options: Partial<GoAContext> & { onStatus?: (status: string) => void; onFinalToken?: (token: string) => void } = {}
): Promise<GoAResult> {
  const k = options.k ?? 3;
  const tau = options.tau ?? 0.05;
  const pooling = options.pooling ?? "max";

  console.log(`[GoA] Starting pipeline for query: "${query}"`);
  options.onStatus?.("Synchronizing memory...");

  // --- Stage 0: Memory Retrieval ---
  const keywords = await extractKeywords(query);
  const memoryTriplets = await getRelevantMemory(keywords);
  const memoryContext = memoryTriplets.length > 0
    ? memoryTriplets.map(t => `${t.subject} ${t.predicate} ${t.object}`).join("\n")
    : undefined;

  if (memoryContext) {
    options.onStatus?.("Memory Synchronized ✓");
    console.log(`[GoA] Memory integrated: ${memoryTriplets.length} facts found.`);
  } else {
    options.onStatus?.("No relevant memory found.");
  }

  // --- Stage 1: Node Sampling ---
  const samplingResponse = await chatWithRetry(
    [{ role: "user", content: NODE_SAMPLING_PROMPT(query, allCards, k, memoryContext) }],
    { model: META_MODEL, json_mode: true }
  );
  const { selected_ids } = JSON.parse(samplingResponse);
  const selectedAgents = allCards.filter(c => selected_ids.includes(c.id));
  console.log(`[GoA] Selected agents: ${selectedAgents.map(a => a.name).join(", ")}`);
  options.onStatus?.("Experts generating initial responses...");

  // --- Stage 2: Initial Responses (Parallel) ---
  const initResponses: AgentResponse[] = await Promise.all(
    selectedAgents.map(async agent => {
      const content = await chatWithRetry([{ role: "user", content: query }], { model: agent.id });
      return { agentId: agent.id, content };
    })
  );

  // --- Stage 3: Edge Sampling & Scoring Matrix ---
  options.onStatus?.("Cross-evaluating expert reasoning...");
  const matrix: AdjacencyMatrix = {};
  await Promise.all(
    selectedAgents.map(async sourceAgent => {
      matrix[sourceAgent.id] = {};
      await Promise.all(
        selectedAgents.map(async targetAgent => {
          if (sourceAgent.id === targetAgent.id) return;

          const targetResponse = initResponses.find(r => r.agentId === targetAgent.id)!.content;
          const scoreJson = await chatWithRetry(
            [{ role: "user", content: RELEVANCE_SCORING_PROMPT(query, targetResponse, memoryContext) }],
            { model: sourceAgent.id, json_mode: true }
          );
          const { score } = JSON.parse(scoreJson);
          matrix[sourceAgent.id][targetAgent.id] = score;
        })
      );
    })
  );

  // Partition by centrality (simplified: sum of incoming scores)
  const centrality: Record<string, number> = {};
  selectedAgents.forEach(a => (centrality[a.id] = 0));
  for (const sourceId in matrix) {
    for (const targetId in matrix[sourceId]) {
      centrality[targetId] += matrix[sourceId][targetId];
    }
  }

  const sortedIds = Object.keys(centrality).sort((a, b) => centrality[b] - centrality[a]);
  const sourceNodes = sortedIds.slice(0, Math.ceil(k / 2));
  const targetNodes = sortedIds.slice(Math.ceil(k / 2));
  console.log(`[GoA] Partition: Sources [${sourceNodes.join(", ")}], Targets [${targetNodes.join(", ")}]`);

  // --- Stage 4: Bidirectional Message Passing ---
  options.onStatus?.("Experts refining their perspectives...");

  // Phase A: Forward Pass (Source -> Target)
  const forwardResponses: AgentResponse[] = await Promise.all(
    targetNodes.map(async tId => {
      const targetAgent = selectedAgents.find(a => a.id === tId)!;
      const initialResponse = initResponses.find(r => r.agentId === tId)!.content;
      const sourceContexts = sourceNodes
        .filter(sId => matrix[sId][tId] > tau)
        .map(sId => initResponses.find(r => r.agentId === sId)!.content);

      const refined = await chatWithRetry(
        [{ role: "user", content: REFINEMENT_PROMPT(query, initialResponse, sourceContexts, memoryContext) }],
        { model: tId }
      );
      return { agentId: tId, content: refined };
    })
  );

  // Phase B: Reverse Pass (Target -> Source)
  const finalResponses: AgentResponse[] = await Promise.all(
    sourceNodes.map(async sId => {
      const sourceAgent = selectedAgents.find(a => a.id === sId)!;
      const initialResponse = initResponses.find(r => r.agentId === sId)!.content;
      const targetContexts = targetNodes
        .filter(tId => matrix[tId][sId] > tau)
        .map(tId => forwardResponses.find(r => r.agentId === tId)!.content);

      const refined = await chatWithRetry(
        [{ role: "user", content: REFINEMENT_PROMPT(query, initialResponse, targetContexts, memoryContext) }],
        { model: sId }
      );
      return { agentId: sId, content: refined };
    })
  );

  const allFinal = [...finalResponses, ...forwardResponses];

  // --- Stage 5: Pooling ---
  options.onStatus?.("Synthesizing final intelligence...");
  let finalResponse = "";
  if (pooling === "max") {
    // GoA-Max: Meta-LLM selects best
    const bestResponseJson = await chatWithRetry(
      [
        {
          role: "user",
          content: `Select the best response from the following:\n${allFinal
            .map((r, i) => `Option ${i + 1}: ${r.content}`)
            .join("\n\n")}\nRespond with JSON: {"best_index": 0}`
        }
      ],
      { model: META_MODEL, json_mode: true }
    );
    const { best_index } = JSON.parse(bestResponseJson);
    finalResponse = allFinal[best_index].content;
    if (options.onFinalToken) {
      // Simulate streaming for pre-generated best response
      const tokens = finalResponse.split(" ");
      for (const token of tokens) {
        options.onFinalToken(token + " ");
        await new Promise(r => setTimeout(r, 20));
      }
    }
  } else {
    // GoA-Mean: Synthesis (Actual Streaming)
    if (options.onFinalToken) {
      await streamChat(
        [{ role: "user", content: POOLING_SYNTHESIS_PROMPT(query, allFinal.map(r => r.content), memoryContext) }],
        { model: META_MODEL },
        options.onFinalToken
      );
      // Wait for complete response if needed or just use streamed content
      // Note: In real app, we'd accumulate tokens
    } else {
      finalResponse = await chatWithRetry(
        [{ role: "user", content: POOLING_SYNTHESIS_PROMPT(query, allFinal.map(r => r.content), memoryContext) }],
        { model: META_MODEL }
      );
    }
  }

  // --- Stage 6: Knowledge Extraction (Async) ---
  const transcript = `User: ${query}\nAssistant: ${finalResponse}`;
  extractTriplets(transcript).then(triplets => {
    if (triplets.length > 0) {
      console.log(`[GoA] Extracted ${triplets.length} triplets.`);
      storeTriplets(triplets).catch(err => console.error("Failed to store triplets:", err));
    }
  }).catch(err => console.error("Extraction failed:", err));

  return {
    finalResponse,
    selectedAgents,
    matrix,
    sourceNodes,
    targetNodes
  };
}
