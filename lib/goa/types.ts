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
  complexity?: "low" | "medium" | "high";
}

export interface AdjacencyMatrix {
  [sourceId: string]: {
    [targetId: string]: number;
  };
}

export interface StabilityMetrics {
  ksStatistic: number;
  entropyReduction: number;
  isStable: boolean;
}

export interface ConvergenceMetrics extends StabilityMetrics {
  iterations: number;
}

export interface KnowledgeTriplet {
  subject: string;
  predicate: string;
  object: string;
}

export interface GoAResult {
  finalResponse: string;
  selectedAgents: ModelCard[];
  matrix: AdjacencyMatrix;
  sourceNodes: string[];
  targetNodes: string[];
  metrics?: ConvergenceMetrics;
  debateLog?: { turn: number; model: string; content: string }[];
  harmonyScore?: number;
  extractedTriplets?: KnowledgeTriplet[];
  complexity?: "low" | "medium" | "high";
}
