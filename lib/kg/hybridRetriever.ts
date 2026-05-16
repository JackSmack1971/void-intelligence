import { getRelevantMemory as getSqliteMemory } from "./db";
import { VectorStore } from "./chroma";
import { KnowledgeTriplet as Triplet } from "../goa/types";

/**
 * Hybrid Retriever: Combines SQLite (Keyword/BM25) and Chroma (Semantic) search.
 * Uses Reciprocal Rank Fusion (RRF) to merge and rank results.
 */
export async function getHybridMemory(query: string, keywords: string[], limit: number = 15): Promise<Triplet[]> {
  // Parallel execution of both retrieval branches
  const [sqliteResults, chromaResults] = await Promise.all([
    getSqliteMemory(keywords),
    VectorStore.getInstance().then(v => v.querySemantic(query, limit)).catch(() => [])
  ]);

  // Reciprocal Rank Fusion (RRF)
  // Scores = sum( 1 / (k + rank) )
  const k = 60;
  const scores = new Map<string, number>();
  const tripletMap = new Map<string, Triplet>();

  const processList = (list: Triplet[], weight: number) => {
    list.forEach((t, i) => {
      const key = `${t.subject}-${t.predicate}-${t.object}`;
      const currentScore = scores.get(key) || 0;
      scores.set(key, currentScore + weight * (1 / (k + i)));
      tripletMap.set(key, t);
    });
  };

  // SQLite results get a slight priority (weight 1.2) for exactness
  processList(sqliteResults, 1.2);
  processList(chromaResults, 1.0);

  // Sort by RRF score and return top results
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => tripletMap.get(key)!);
}
