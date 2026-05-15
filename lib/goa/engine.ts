import { chatWithRetry, streamChat } from "../openrouter/client";
import { ModelCard, GoAContext, AdjacencyMatrix, GoAResult, AgentResponse, ConvergenceMetrics } from "./types";
import {
  NODE_SAMPLING_PROMPT,
  RELEVANCE_SCORING_PROMPT,
  REFINEMENT_PROMPT,
  POOLING_SYNTHESIS_PROMPT,
  ADVERSARIAL_CRITIQUE_PROMPT,
  PD_TOT_JUDGE_PROMPT
} from "./prompts";
import { extractionQueue } from "../kg/queue";
import { getRelevantMemory } from "../kg/db";
import { Telemetry } from "../utils/telemetry";
import { computeKSStatistic, computeEntropyReduction, evaluateStability } from "./stability";

const META_MODEL = "inclusionai/ring-2.6-1t:free";
const JUDGE_MODEL = "deepseek/deepseek-v4-flash"; // Recommended for meta-reasoning in 2026 report

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
  }

  // --- Stage 1: Node Sampling ---
  const samplingResponse = await chatWithRetry(
    [{ role: "user", content: NODE_SAMPLING_PROMPT(query, allCards, k, memoryContext) }],
    { intent: "sampling", json_mode: true }
  );
  const { selected_ids } = JSON.parse(samplingResponse);
  const selectedAgents = allCards.filter(c => selected_ids.includes(c.id));
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
  if (variance < 0.15) {
    options.onStatus?.("High consensus detected. Finalizing...");
    const bestAgentId = Object.keys(matrix).reduce((a, b) => {
      const scoreA = Object.values(matrix[a] || {}).reduce((sum, s) => sum + s, 0);
      const scoreB = Object.values(matrix[b] || {}).reduce((sum, s) => sum + s, 0);
      return scoreA > scoreB ? a : b;
    });
    const bestResponse = initResponses.find(r => r.agentId === bestAgentId)!.content;
    return finalizeGoA(query, bestResponse, selectedAgents, matrix, [], [], options);
  }

  // --- Stage 4: Adversarial Debate ---
  options.onStatus?.("Initiating Adversarial Debate...");
  const debateLog: { turn: number; model: string; content: string }[] = [];
  let currentResponses = initResponses;
  let iterations = 0;
  const MAX_ITERATIONS = 3;
  let metrics: ConvergenceMetrics = { ksStatistic: 1, entropyReduction: 0, iterations: 0, isStable: false };

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    options.onStatus?.(`Debate Round ${iterations}: Critiquing...`);
    
    // 1. Critique Phase (Parallel)
    const critiques: string[] = await Promise.all(
      currentResponses.map(async (resp, i) => {
        const peerIdx = (i + 1) % currentResponses.length;
        const critique = await chatWithRetry(
          [{ role: "user", content: ADVERSARIAL_CRITIQUE_PROMPT(query, currentResponses[peerIdx].content, memoryContext) }],
          { model: resp.agentId, intent: "refinement" }
        );
        debateLog.push({ turn: iterations, model: resp.agentId, content: `Critique of ${currentResponses[peerIdx].agentId}: ${critique}` });
        return critique;
      })
    );

    // 2. Refinement Phase (Synthesis of critiques)
    options.onStatus?.(`Debate Round ${iterations}: Refining...`);
    const newResponses: AgentResponse[] = await Promise.all(
      currentResponses.map(async (resp, i) => {
        const myCritique = critiques[i];
        const peerCritiqueOfMe = critiques[(i - 1 + currentResponses.length) % currentResponses.length];
        const refined = await chatWithRetry(
          [{ role: "user", content: REFINEMENT_PROMPT(query, resp.content, [myCritique, peerCritiqueOfMe], memoryContext) }],
          { model: resp.agentId, intent: "refinement" }
        );
        return { agentId: resp.agentId, content: refined };
      })
    );

    // 3. Adjudication Phase (Semantic Judge)
    options.onStatus?.(`Debate Round ${iterations}: Adjudicating...`);
    const judgeResponse = await chatWithRetry(
      [{ role: "user", content: PD_TOT_JUDGE_PROMPT(query, currentResponses.map(r => r.content), newResponses.map(r => r.content)) }],
      { model: JUDGE_MODEL, intent: "scoring", json_mode: true }
    );
    const judgeResult = JSON.parse(judgeResponse);
    
    metrics = {
      ksStatistic: judgeResult.ksStatistic,
      entropyReduction: judgeResult.entropyReduction,
      iterations,
      isStable: judgeResult.isStable
    };

    currentResponses = newResponses;
    Telemetry.logStage(`Debate Iteration ${iterations}`);
    options.onStatus?.(`Stability: ${(1 - metrics.ksStatistic).toFixed(2)} | Reduction: ${metrics.entropyReduction.toFixed(4)}`);

    if (metrics.isStable) {
      console.log(`[GoA] Consensus reached via Semantic Judge at round ${iterations}`);
      break;
    }
  }

  // --- Stage 5: Final Synthesis ---
  options.onStatus?.("Synthesizing void consensus...");
  let finalResponse = "";
  if (options.onFinalToken) {
    await streamChat(
      [{ role: "user", content: POOLING_SYNTHESIS_PROMPT(query, currentResponses.map(r => r.content), memoryContext) }],
      { intent: "synthesis" },
      options.onFinalToken
    );
  } else {
    finalResponse = await chatWithRetry(
      [{ role: "user", content: POOLING_SYNTHESIS_PROMPT(query, currentResponses.map(r => r.content), memoryContext) }],
      { intent: "synthesis" }
    );
  }

  return finalizeGoA(query, finalResponse, selectedAgents, matrix, [], [], options, metrics, debateLog);
}

async function finalizeGoA(
  query: string,
  finalResponse: string,
  selectedAgents: ModelCard[],
  matrix: AdjacencyMatrix,
  sourceNodes: string[],
  targetNodes: string[],
  options: any,
  metrics?: ConvergenceMetrics,
  debateLog?: { turn: number; model: string; content: string }[]
): Promise<GoAResult> {
  const transcript = `User: ${query}\nAssistant: ${finalResponse}`;
  extractionQueue.enqueue(options.threadId || "global-thread", transcript);

  return {
    finalResponse,
    selectedAgents,
    matrix,
    sourceNodes,
    targetNodes,
    metrics,
    debateLog
  };
}
