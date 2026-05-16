export interface ModelCard {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  skills?: string[];
}

export interface AgentResponse {
  agentId: string;
  content: string;
  score?: number;
}

export interface GoAContext {
  query: string;
  k: number;
  tau: number;
  pooling: "max" | "mean";
  threadId?: string;
}

export interface AdjacencyMatrix {
  [sourceId: string]: {
    [targetId: string]: number;
  };
}

export interface ConvergenceMetrics {
  ksStatistic: number;
  entropyReduction: number;
  iterations: number;
  isStable: boolean;
}

export interface GoAResult {
  finalResponse: string;
  selectedAgents: ModelCard[];
  matrix: AdjacencyMatrix;
  sourceNodes: string[];
  targetNodes: string[];
  metrics?: ConvergenceMetrics;
  debateLog?: { turn: number; model: string; content: string }[];
}
