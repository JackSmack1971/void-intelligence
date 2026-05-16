import { AdjacencyMatrix } from "./types";

export class DebateScheduler {
  /**
   * Computes waves of agent IDs that can be processed in parallel.
   * Uses Kahn's Algorithm for Topological Sort.
   */
  static computeWaves(agents: string[], matrix: AdjacencyMatrix): string[][] {
    const inDegree: { [id: string]: number } = {};
    const adj: { [id: string]: string[] } = {};

    // Initialize
    agents.forEach(id => {
      inDegree[id] = 0;
      adj[id] = [];
    });

    // Build graph based on matrix (source -> target indicates dependency: target needs source's output)
    // In our case, if matrix[source][target] > 0, it means target critiques source.
    // So target depends on source.
    for (const source in matrix) {
      for (const target in matrix[source]) {
        if (matrix[source][target] > 0) {
          adj[source].push(target);
          inDegree[target]++;
        }
      }
    }

    const waves: string[][] = [];
    let queue = agents.filter(id => inDegree[id] === 0);

    while (queue.length > 0) {
      waves.push([...queue]);
      const nextQueue: string[] = [];

      for (const node of queue) {
        for (const neighbor of adj[node]) {
          inDegree[neighbor]--;
          if (inDegree[neighbor] === 0) {
            nextQueue.push(neighbor);
          }
        }
      }
      queue = nextQueue;
    }

    // Handle cycles or missing nodes by putting leftovers in a final wave
    const processed = new Set(waves.flat());
    const leftovers = agents.filter(id => !processed.has(id));
    if (leftovers.length > 0) {
      waves.push(leftovers);
    }

    return waves;
  }
}
