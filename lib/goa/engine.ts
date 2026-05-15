import { chatWithRetry, streamChat } from "../openrouter/client";
import { ModelCard, GoAContext, AdjacencyMatrix, GoAResult, AgentResponse } from "./types";
import {
  NODE_SAMPLING_PROMPT,
  RELEVANCE_SCORING_PROMPT,
  REFINEMENT_PROMPT,
  POOLING_SYNTHESIS_PROMPT
} from "./prompts";
import { extractionQueue } from "../kg/queue";
import { getRelevantMemory } from "../kg/db";
import { Telemetry } from "../utils/telemetry";

const META_MODEL = "inclusionai/ring-2.6-1t:free";

/**
 * Stage 0: Memory Retrieval
 */
async function extractKeywords(query: string): Promise<string[]> {
  Telemetry.start();
  try {
    const prompt = `User Query: "${query}"\nExtract 3-5 core entities or search keywords for a database search. Respond ONLY with a comma-separated list.`;
    const response = await chatWithRetry([{ role: "user", content: prompt }], { intent: "sampling" });
    const keywords = response.split(",").map(k => k.trim()).filter(Boolean);
    Telemetry.logStage("Memory Keywords Extraction");
    return keywords;
  } catch (err) {
    console.error("[GoA] Keyword extraction failed:", err);
    return [];
  }
}

function calculateVariance(matrix: AdjacencyMatrix): number {
  const scores: number[] = [];
  for (const sourceId in matrix) {
    for (const targetId in matrix[sourceId]) {
      scores.push(matrix[sourceId][targetId]);
    }
  }
  if (scores.length === 0) return 0;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  return variance;
}

function getDynamicK(query: string, defaultK: number): number {
  // Simple heuristic: complex queries (many words or technical terms) get more agents
  const words = query.split(/\s+/).length;
  if (words > 20) return Math.min(defaultK + 2, 5);
  if (words < 5) return Math.max(defaultK - 1, 2);
  return defaultK;
}

export async function runGoA(
  query: string,
  allCards: ModelCard[],
  options: Partial<GoAContext> & { onStatus?: (status: string) => void; onFinalToken?: (token: string) => void } = {}
): Promise<GoAResult> {
  const k = getDynamicK(query, options.k ?? 3);
  const tau = options.tau ?? 0.05;
  const pooling = options.pooling ?? "max";

  console.log(`[GoA] Starting pipeline for query: "${query}" (k=${k})`);
  options.onStatus?.("Synchronizing memory...");

  // --- Stage 0: Memory Retrieval ---
  const keywords = await extractKeywords(query);
  const memoryTriplets = await getRelevantMemory(keywords);
  const memoryContext = memoryTriplets.length > 0
    ? memoryTriplets.map(t => `${t.subject} ${t.predicate} ${t.object}`).join("\n")
    : undefined;

  Telemetry.logStage("Memory Retrieval");

  if (memoryContext) {
    options.onStatus?.("Memory Synchronized ✓");
    console.log(`[GoA] Memory integrated: ${memoryTriplets.length} facts found.`);
  } else {
    options.onStatus?.("No relevant memory found.");
  }

  // --- Stage 1: Node Sampling ---
  const samplingResponse = await chatWithRetry(
    [{ role: "user", content: NODE_SAMPLING_PROMPT(query, allCards, k, memoryContext) }],
    { intent: "sampling", json_mode: true }
  );
  const { selected_ids } = JSON.parse(samplingResponse);
  const selectedAgents = allCards.filter(c => selected_ids.includes(c.id));
  console.log(`[GoA] Selected agents: ${selectedAgents.map(a => a.name).join(", ")}`);
  Telemetry.logStage("Node Sampling");
  options.onStatus?.("Experts generating initial responses...");

  // --- Stage 2: Initial Responses (Parallel) ---
  const initResponses: AgentResponse[] = await Promise.all(
    selectedAgents.map(async agent => {
      const content = await chatWithRetry([{ role: "user", content: query }], { model: agent.id });
      return { agentId: agent.id, content };
    })
  );
  Telemetry.logStage("Initial Generation");

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
            { model: sourceAgent.id, intent: "scoring", json_mode: true }
          );
          const { score } = JSON.parse(scoreJson);
          matrix[sourceAgent.id][targetAgent.id] = score;
        })
      );
    })
  );
  Telemetry.logStage("Cross-Evaluation");

  const variance = calculateVariance(matrix);
  Telemetry.logMetric("Adjacency Variance", variance);

  if (variance < 0.15) {
    console.log("[GoA] High consensus detected (variance < 0.15). Skipping refinement.");
    options.onStatus?.("High consensus detected. Finalizing...");
    const bestAgentId = Object.keys(matrix).reduce((a, b) => {
      const scoreA = Object.values(matrix[a] || {}).reduce((sum, s) => sum + s, 0);
      const scoreB = Object.values(matrix[b] || {}).reduce((sum, s) => sum + s, 0);
      return scoreA > scoreB ? a : b;
    });
    const bestResponse = initResponses.find(r => r.agentId === bestAgentId)!.content;
    
    // Simulate Stage 5 & 6 for this path
    return finalizeGoA(query, bestResponse, selectedAgents, matrix, [], [], options);
  }

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

  // --- Stage 4: Iterative Bidirectional Message Passing ---
  options.onStatus?.("Experts refining their perspectives...");
  
  let currentResponses = initResponses;
  let iterations = 0;
  const MAX_ITERATIONS = 2;
  const TAU_DELTA = 0.02;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    console.log(`[GoA] Refinement Iteration ${iterations}`);

    // Phase A: Forward Pass (Source -> Target)
    const forwardResponses: AgentResponse[] = await Promise.all(
      targetNodes.map(async tId => {
        const initialResponse = currentResponses.find(r => r.agentId === tId)!.content;
        const sourceContexts = sourceNodes
          .filter(sId => matrix[sId][tId] > tau)
          .map(sId => currentResponses.find(r => r.agentId === sId)!.content);

        const refined = await chatWithRetry(
          [{ role: "user", content: REFINEMENT_PROMPT(query, initialResponse, sourceContexts, memoryContext) }],
          { model: tId, intent: "refinement" }
        );
        return { agentId: tId, content: refined };
      })
    );

    // Phase B: Reverse Pass (Target -> Source)
    const reverseResponses: AgentResponse[] = await Promise.all(
      sourceNodes.map(async sId => {
        const initialResponse = currentResponses.find(r => r.agentId === sId)!.content;
        const targetContexts = targetNodes
          .filter(tId => matrix[tId][sId] > tau)
          .map(tId => forwardResponses.find(r => r.agentId === tId)!.content);

        const refined = await chatWithRetry(
          [{ role: "user", content: REFINEMENT_PROMPT(query, initialResponse, targetContexts, memoryContext) }],
          { model: sId, intent: "refinement" }
        );
        return { agentId: sId, content: refined };
      })
    );

    const newResponses = [...reverseResponses, ...forwardResponses];
    
    // Check for convergence (simplified: average content length change)
    const oldLen = currentResponses.reduce((sum, r) => sum + r.content.length, 0) / currentResponses.length;
    const newLen = newResponses.reduce((sum, r) => sum + r.content.length, 0) / newResponses.length;
    const delta = Math.abs(newLen - oldLen) / oldLen;
    
    currentResponses = newResponses;
    Telemetry.logStage(`Refinement Iteration ${iterations}`);

    if (delta < TAU_DELTA) {
      console.log(`[GoA] Convergence reached at iteration ${iterations} (delta=${delta.toFixed(4)})`);
      break;
    }
  }

  const allFinal = currentResponses;

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
      { intent: "scoring", json_mode: true }
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
        { intent: "synthesis" },
        options.onFinalToken
      );
    } else {
      finalResponse = await chatWithRetry(
        [{ role: "user", content: POOLING_SYNTHESIS_PROMPT(query, allFinal.map(r => r.content), memoryContext) }],
        { intent: "synthesis" }
      );
    }
  }
  Telemetry.logStage("Synthesis");

  return finalizeGoA(query, finalResponse, selectedAgents, matrix, sourceNodes, targetNodes, options);
}

/**
 * Shared finalization logic for both normal and skip-refinement paths.
 */
async function finalizeGoA(
  query: string,
  finalResponse: string,
  selectedAgents: ModelCard[],
  matrix: AdjacencyMatrix,
  sourceNodes: string[],
  targetNodes: string[],
  options: any
): Promise<GoAResult> {
  // --- Stage 6: Knowledge Extraction (Async/Debounced) ---
  const transcript = `User: ${query}\nAssistant: ${finalResponse}`;
  const threadId = options.threadId || "global-thread";
  extractionQueue.enqueue(threadId, transcript);

  return {
    finalResponse,
    selectedAgents,
    matrix,
    sourceNodes,
    targetNodes
  };
}
