import { ModelCard, GoAContext, AdjacencyMatrix, GoAResult, AgentResponse, ConvergenceMetrics } from "./types";
import {
  NODE_SAMPLING_PROMPT,
  RELEVANCE_SCORING_PROMPT,
  REFINEMENT_PROMPT,
  POOLING_SYNTHESIS_PROMPT,
  ADVERSARIAL_CRITIQUE_PROMPT,
  PD_TOT_JUDGE_PROMPT
} from "./prompts";
import { KnowledgeGraph } from "../kg";
import { Telemetry } from "../utils/telemetry";
import { LLMProvider } from "../ports/llm";
import { OpenRouterAdapter } from "../adapters/openrouter";

const META_MODEL = "inclusionai/ring-2.6-1t:free";
const JUDGE_MODEL = "deepseek/deepseek-v4-flash";

export class GoAOrchestrator {
  constructor(private llm: LLMProvider = new OpenRouterAdapter()) {}

  async run(
    query: string,
    allCards: ModelCard[],
    options: Partial<GoAContext> & { onStatus?: (status: string) => void; onFinalToken?: (token: string) => void } = {}
  ): Promise<GoAResult> {
    const kg = await KnowledgeGraph.getInstance();
    const k = this.getDynamicK(query, options.k ?? 3);

    const tau = options.tau ?? 0.05;

    console.log(`[GoA] Starting pipeline for query: "${query}" (k=${k})`);
    options.onStatus?.("Synchronizing memory...");

    // Stage 0: Memory Retrieval
    const memoryContext = await this.retrieveMemory(query, kg);
    if (memoryContext) options.onStatus?.("Memory Synchronized ✓");


    // Stage 1: Node Sampling
    const selectedAgents = await this.sampleNodes(query, allCards, k, memoryContext);
    options.onStatus?.("Experts generating initial responses...");

    // Stage 2: Initial Responses
    const initResponses = await this.generateInitialResponses(query, selectedAgents);

    // Stage 3: Cross-Evaluation
    options.onStatus?.("Cross-evaluating expert reasoning...");
    const matrix = await this.scoreMatrix(query, selectedAgents, initResponses, memoryContext);

    // Stage 4: Adversarial Debate
    options.onStatus?.("Initiating Adversarial Debate...");
    const { finalResponses, metrics, debateLog } = await this.conductDebate(query, selectedAgents, initResponses, memoryContext, options);

    // Stage 5: Final Synthesis
    options.onStatus?.("Synthesizing void consensus...");
    const finalResponse = await this.synthesize(query, finalResponses, memoryContext, options);

    return this.finalize(query, finalResponse, selectedAgents, matrix, options, kg, metrics, debateLog);
  }


  private getDynamicK(query: string, defaultK: number): number {
    const words = query.split(/\s+/).length;
    if (words > 20) return Math.min(defaultK + 2, 5);
    if (words < 5) return Math.max(defaultK - 1, 2);
    return defaultK;
  }

  private async retrieveMemory(query: string, kg: KnowledgeGraph): Promise<string | undefined> {
    const prompt = `User Query: "${query}"\nExtract 3-5 core entities or search keywords for a database search. Respond ONLY with a comma-separated list.`;
    const response = await this.llm.chat([{ role: "user", content: prompt }], { intent: "sampling" });
    const keywords = response.split(",").map(k => k.trim()).filter(Boolean);
    const memoryTriplets = await kg.query(keywords);
    return memoryTriplets.length > 0
      ? memoryTriplets.map(t => `${t.subject} ${t.predicate} ${t.object}`).join("\n")
      : undefined;
  }


  private async sampleNodes(query: string, allCards: ModelCard[], k: number, memoryContext?: string): Promise<ModelCard[]> {
    const response = await this.llm.chat(
      [{ role: "user", content: NODE_SAMPLING_PROMPT(query, allCards, k, memoryContext) }],
      { intent: "sampling", json_mode: true }
    );
    const { selected_ids } = JSON.parse(response);
    return allCards.filter(c => selected_ids.includes(c.id));
  }

  private async generateInitialResponses(query: string, agents: ModelCard[]): Promise<AgentResponse[]> {
    return Promise.all(
      agents.map(async agent => {
        const content = await this.llm.chat([{ role: "user", content: query }], { model: agent.id });
        return { agentId: agent.id, content };
      })
    );
  }

  private async scoreMatrix(query: string, agents: ModelCard[], responses: AgentResponse[], memoryContext?: string): Promise<AdjacencyMatrix> {
    const matrix: AdjacencyMatrix = {};
    await Promise.all(
      agents.map(async sourceAgent => {
        matrix[sourceAgent.id] = {};
        await Promise.all(
          agents.map(async targetAgent => {
            if (sourceAgent.id === targetAgent.id) return;
            const targetResponse = responses.find(r => r.agentId === targetAgent.id)!.content;
            const scoreJson = await this.llm.chat(
              [{ role: "user", content: RELEVANCE_SCORING_PROMPT(query, targetResponse, memoryContext) }],
              { model: sourceAgent.id, intent: "scoring", json_mode: true }
            );
            const { score } = JSON.parse(scoreJson);
            matrix[sourceAgent.id][targetAgent.id] = score;
          })
        );
      })
    );
    return matrix;
  }

  private async conductDebate(
    query: string,
    agents: ModelCard[],
    initResponses: AgentResponse[],
    memoryContext: string | undefined,
    options: any
  ) {
    const debateLog: { turn: number; model: string; content: string }[] = [];
    let currentResponses = initResponses;
    let iterations = 0;
    const MAX_ITERATIONS = 3;
    let metrics: ConvergenceMetrics = { ksStatistic: 1, entropyReduction: 0, iterations: 0, isStable: false };

    while (iterations < MAX_ITERATIONS) {
      iterations++;
      options.onStatus?.(`Debate Round ${iterations}...`);
      
      const critiques: string[] = await Promise.all(
        currentResponses.map(async (resp, i) => {
          const peerIdx = (i + 1) % currentResponses.length;
          const critique = await this.llm.chat(
            [{ role: "user", content: ADVERSARIAL_CRITIQUE_PROMPT(query, currentResponses[peerIdx].content, memoryContext) }],
            { model: resp.agentId, intent: "refinement" }
          );
          debateLog.push({ turn: iterations, model: resp.agentId, content: `Critique of ${currentResponses[peerIdx].agentId}: ${critique}` });
          return critique;
        })
      );

      const newResponses: AgentResponse[] = await Promise.all(
        currentResponses.map(async (resp, i) => {
          const myCritique = critiques[i];
          const peerCritiqueOfMe = critiques[(i - 1 + currentResponses.length) % currentResponses.length];
          const refined = await this.llm.chat(
            [{ role: "user", content: REFINEMENT_PROMPT(query, resp.content, [myCritique, peerCritiqueOfMe], memoryContext) }],
            { model: resp.agentId, intent: "refinement" }
          );
          return { agentId: resp.agentId, content: refined };
        })
      );

      const judgeResponse = await this.llm.chat(
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

      const stability = (1 - metrics.ksStatistic) * 100;
      options.onStatus?.(`Debate Round ${iterations}: Stability ${stability.toFixed(0)}%`);


      currentResponses = newResponses;
      if (metrics.isStable) break;
    }

    return { finalResponses: currentResponses, metrics, debateLog };
  }

  private async synthesize(query: string, responses: AgentResponse[], memoryContext: string | undefined, options: any): Promise<string> {
    const prompt = POOLING_SYNTHESIS_PROMPT(query, responses.map(r => r.content), memoryContext);
    if (options.onFinalToken) {
      await this.llm.stream([{ role: "user", content: prompt }], { intent: "synthesis" }, options.onFinalToken);
      return "";
    } else {
      return this.llm.chat([{ role: "user", content: prompt }], { intent: "synthesis" });
    }
  }

  private async finalize(
    query: string,
    finalResponse: string,
    selectedAgents: ModelCard[],
    matrix: AdjacencyMatrix,
    options: any,
    kg: KnowledgeGraph,
    metrics?: ConvergenceMetrics,
    debateLog?: { turn: number; model: string; content: string }[]
  ): Promise<GoAResult> {
    const transcript = `User: ${query}\nAssistant: ${finalResponse}`;
    kg.ingestTranscript(options.threadId || "global-thread", transcript);


    return {
      finalResponse,
      selectedAgents,
      matrix,
      sourceNodes: [],
      targetNodes: [],
      metrics,
      debateLog
    };
  }
}

// Compatibility layer for Phase 10/11 transitions
export async function runGoA(query: string, allCards: ModelCard[], options: any = {}): Promise<GoAResult> {
  const orchestrator = new GoAOrchestrator();
  return orchestrator.run(query, allCards, options);
}
