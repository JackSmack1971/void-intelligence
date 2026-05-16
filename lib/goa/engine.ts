import { ModelCard, GoAContext, AdjacencyMatrix, GoAResult, AgentResponse, ConvergenceMetrics } from "./types";
import {
  NODE_SAMPLING_PROMPT,
  RELEVANCE_SCORING_PROMPT,
  REFINEMENT_PROMPT,
  POOLING_SYNTHESIS_PROMPT,
  ADVERSARIAL_CRITIQUE_PROMPT,
  PD_TOT_JUDGE_PROMPT,
  COMPLEXITY_CLASSIFICATION_PROMPT,
  SUMMARIZATION_PROMPT
} from "./prompts";
import { KnowledgeGraph } from "../kg";
import { Telemetry } from "../utils/telemetry";
import { LLMProvider } from "../ports/llm";
import { OpenRouterAdapter } from "../adapters/openrouter";
import { DebateScheduler } from "./scheduler";

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
    
    options.onStatus?.("Analyzing query complexity...");
    const complexity = await this.determineComplexity(query);
    options.complexity = complexity;

    const k = this.getDynamicK(query, options.k ?? 3, complexity);
    options.onStatus?.("Synchronizing memory...");

    const memoryContext = await this.retrieveMemory(query, kg);
    if (memoryContext) options.onStatus?.("Memory Synchronized ✓");

    const selectedAgents = await this.selectExpertAgents(query, allCards, k, memoryContext);
    options.onStatus?.("Experts generating initial responses...");

    const initResponses = await this.generateInitialResponses(query, selectedAgents);

    options.onStatus?.("Cross-evaluating expert reasoning...");
    const adjacencyMatrix = await this.computeAdjacencyMatrix(query, selectedAgents, initResponses, memoryContext);

    options.onStatus?.("Initiating Adversarial Debate...");
    const debate = await this.conductDebate(query, selectedAgents, initResponses, memoryContext, options, adjacencyMatrix);

    options.onStatus?.("Synthesizing void consensus...");
    const finalResponse = await this.synthesize(query, debate.finalResponses, debate.summarizedContext, options);

    const harmonyScore = this.calculateHarmonyScore(debate.metrics, debate.iterations);

    return this.finalize(
      query, 
      finalResponse, 
      selectedAgents, 
      adjacencyMatrix, 
      options, 
      kg, 
      debate.metrics, 
      debate.debateLog, 
      harmonyScore
    );
  }

  async resume(
    query: string,
    existingLog: { turn: number; model: string; content: string }[],
    selectedAgents: ModelCard[],
    matrix: AdjacencyMatrix,
    options: any = {}
  ): Promise<GoAResult> {
    const kg = await KnowledgeGraph.getInstance();
    const memoryContext = await this.retrieveMemory(query, kg);

    // Initial responses from the last complete round in the log
    const lastTurn = Math.max(...existingLog.map(l => l.turn));
    const initResponses: AgentResponse[] = selectedAgents.map(agent => {
      const entry = [...existingLog].reverse().find(l => l.model === agent.id && l.turn === lastTurn);
      return { agentId: agent.id, content: entry?.content || "" };
    });

    const { finalResponses, metrics, debateLog, summarizedContext, iterations } = await this.conductDebate(
      query, selectedAgents, initResponses, memoryContext, options, matrix
    );

    const finalResponse = await this.synthesize(query, finalResponses, summarizedContext, options);
    const harmonyScore = this.calculateHarmonyScore(metrics, lastTurn + iterations);

    return this.finalize(query, finalResponse, selectedAgents, matrix, options, kg, metrics, [...existingLog, ...debateLog], harmonyScore);
  }

  private async determineComplexity(query: string): Promise<"low" | "medium" | "high"> {
    try {
      const response = await this.llm.chat(
        [{ role: "user", content: COMPLEXITY_CLASSIFICATION_PROMPT(query) }],
        { intent: "sampling", json_mode: true }
      );
      const { complexity } = JSON.parse(response);
      return complexity || "medium";
    } catch (error) {
      console.warn("[GoA] Complexity classification failed, defaulting to medium", error);
      return "medium";
    }
  }

  private getDynamicK(query: string, defaultK: number, complexity: string): number {
    let k = defaultK;
    if (complexity === "high") k += 1;
    if (complexity === "low") k = Math.max(k - 1, 2);

    const words = query.split(/\s+/).length;
    if (words > 20) k = Math.min(k + 1, 5);

    return Math.min(k, 5);
  }

  private async retrieveMemory(query: string, kg: KnowledgeGraph): Promise<string | undefined> {
    const prompt = `User Query: "${query}"\nExtract 3-5 core entities or search keywords for a database search. Respond ONLY with a comma-separated list.`;
    const response = await this.llm.chat([{ role: "user", content: prompt }], { intent: "sampling" });
    const keywords = response.split(",").map(k => k.trim()).filter(Boolean);
    const memoryTriplets = await kg.query(query, keywords);
    return memoryTriplets.length > 0
      ? memoryTriplets.map(t => `${t.subject} ${t.predicate} ${t.object}`).join("\n")
      : undefined;
  }


  private async selectExpertAgents(query: string, allCards: ModelCard[], k: number, memoryContext?: string): Promise<ModelCard[]> {
    const response = await this.llm.chat(
      [{ role: "user", content: NODE_SAMPLING_PROMPT(query, allCards, k, memoryContext) }],
      { intent: "sampling", json_mode: true }
    );
    const { selected_ids } = JSON.parse(response);
    return allCards.filter(c => selected_ids.includes(c.id)).slice(0, k);
  }

  private async generateInitialResponses(query: string, agents: ModelCard[]): Promise<AgentResponse[]> {
    return Promise.all(
      agents.map(async agent => {
        const content = await this.llm.chat([{ role: "user", content: query }], { model: agent.id });
        return { agentId: agent.id, content };
      })
    );
  }

  private async computeAdjacencyMatrix(query: string, agents: ModelCard[], responses: AgentResponse[], memoryContext?: string): Promise<AdjacencyMatrix> {
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
    options: any,
    matrix: AdjacencyMatrix
  ) {
    const debateLog: { turn: number; model: string; content: string }[] = [];
    let currentResponses = initResponses;
    let iterations = 0;
    const MAX_ITERATIONS = 3;
    let metrics: ConvergenceMetrics = { ksStatistic: 1, entropyReduction: 0, iterations: 0, isStable: false };

    const waves = DebateScheduler.computeWaves(agents.map(a => a.id), matrix);

    while (iterations < MAX_ITERATIONS) {
      iterations++;
      options.onStatus?.(`Debate Round ${iterations}...`);
      
      const roundCritiques: { [targetId: string]: string[] } = {};
      agents.forEach(a => roundCritiques[a.id] = []);

      // Mid-flight Pivot: Escalate judge model if struggling
      const currentJudge = (iterations >= 2 && !metrics.isStable) ? "meta-llama/llama-3.3-70b" : JUDGE_MODEL;
      if (currentJudge !== JUDGE_MODEL) console.log(`[GoA] Escalating to heavy model for Round ${iterations}`);

      for (let w = 0; w < waves.length; w++) {
        const wave = waves[w];
        await Promise.all(
          wave.map(async (agentId) => {
            const agentIdx = agents.findIndex(a => a.id === agentId);
            const peerIdx = (agentIdx + 1) % agents.length;
            const targetAgent = agents[peerIdx];

            const critique = await this.llm.chat(
              [{ role: "user", content: ADVERSARIAL_CRITIQUE_PROMPT(query, currentResponses[peerIdx].content, memoryContext) }],
              { model: agentId, intent: "refinement" }
            );

            roundCritiques[targetAgent.id].push(critique);
            debateLog.push({ turn: iterations, model: agentId, content: `Critique of ${targetAgent.id}: ${critique}` });
          })
        );
      }

      const newResponses: AgentResponse[] = await Promise.all(
        currentResponses.map(async (resp) => {
          const critiquesOfMe = roundCritiques[resp.agentId];
          const otherPerspectives = currentResponses
            .filter(r => r.agentId !== resp.agentId)
            .map(r => r.content);

          const refined = await this.llm.chat(
            [{ role: "user", content: REFINEMENT_PROMPT(query, resp.content, critiquesOfMe, otherPerspectives, memoryContext) }],
            { model: resp.agentId, intent: "refinement" }
          );
          return { agentId: resp.agentId, content: refined };
        })
      );

      const judgeResponse = await this.llm.chat(
        [{ role: "user", content: PD_TOT_JUDGE_PROMPT(query, currentResponses.map(r => r.content), newResponses.map(r => r.content)) }],
        { model: currentJudge, intent: "scoring", json_mode: true }
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

    let summarizedContext = memoryContext;
    if (iterations > 1) {
      const fullLog = debateLog.map(l => `[Round ${l.turn}] ${l.model}: ${l.content}`).join("\n");
      const summary = await this.llm.chat(
        [{ role: "user", content: SUMMARIZATION_PROMPT(query, fullLog) }],
        { model: JUDGE_MODEL, intent: "synthesis" }
      );
      summarizedContext = `${memoryContext}\n\n[DEBATE_SUMMARY]\n${summary}`;
    }

    return { finalResponses: currentResponses, metrics, debateLog, summarizedContext, iterations };
  }

  private calculateHarmonyScore(metrics: ConvergenceMetrics, iters: number): number {
    const stability = 1 - metrics.ksStatistic;
    const entropy = metrics.entropyReduction;
    const speed = 1 / iters;
    return (stability * 0.4) + (entropy * 0.3) + (speed * 0.3);
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
    debateLog?: { turn: number; model: string; content: string }[],
    harmonyScore?: number
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
      debateLog,
      harmonyScore,
      complexity: options.complexity as "low" | "medium" | "high"
    };
  }
}

// Compatibility layer for Phase 10/11 transitions
export async function runGoA(query: string, allCards: ModelCard[], options: any = {}): Promise<GoAResult> {
  const orchestrator = new GoAOrchestrator();
  return orchestrator.run(query, allCards, options);
}
