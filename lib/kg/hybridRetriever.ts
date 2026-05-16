import { getRelevantMemory as getSqliteMemory } from "./db";
import { VectorStore } from "./chroma";
import { KnowledgeTriplet as Triplet } from "../goa/types";

/**
 * Hybrid Retriever: Combines SQLite (Keyword/BM25) and Chroma (Semantic) search.
 * Uses Reciprocal Rank Fusion (RRF) to merge and rank results.
 */
export async function getHybridMemory(query: string, keywords: string[], limit: number = 15): Promise<Triplet[]> {
  // Sanitize limit parameter to be safe from non-positive integers
  const safeLimit = Math.max(1, limit);

  // Parse availability of query and keywords to avoid dead promise evaluations
  const hasQuery = typeof query === "string" && query.trim().length > 0;
  const hasKeywords = Array.isArray(keywords) && keywords.some(k => typeof k === "string" && k.trim().length > 0);

  // Short-circuit immediately if both ingress branches are empty/whitespace
  if (!hasQuery && !hasKeywords) {
    return [];
  }

  // Parallel execution of both retrieval branches with empty-guards
  const [sqliteResults, chromaResults] = await Promise.all([
    hasKeywords ? getSqliteMemory(keywords) : Promise.resolve([]),
    hasQuery ? VectorStore.getInstance().then(v => v.querySemantic(query, safeLimit)).catch(() => []) : Promise.resolve([])
  ]);

  // Reciprocal Rank Fusion (RRF)
  // Scores = sum( weight / (k + rank) )
  const k = 60;
  const scores = new Map<string, number>();
  const tripletMap = new Map<string, Triplet>();

  const processList = (list: Triplet[], weight: number) => {
    if (!list) return;
    list.forEach((t, i) => {
      if (!t || !t.subject || !t.predicate || !t.object) return;

      // Construct folded and canonical match key to prevent case/whitespace duplicate entries
      const key = `${t.subject.trim().toLowerCase()}-${t.predicate.trim().toLowerCase()}-${t.object.trim().toLowerCase()}`;
      
      const currentScore = scores.get(key) || 0;
      scores.set(key, currentScore + weight * (1 / (k + i)));

      // Retain the casing and spacing of the first/highest ranked occurrence
      if (!tripletMap.has(key)) {
        tripletMap.set(key, t);
      }
    });
  };

  // SQLite results get a slight priority (weight 1.2) for exactness
  processList(sqliteResults, 1.2);
  processList(chromaResults, 1.0);

  // Sort by RRF score and return top results
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, safeLimit)
    .map(([key]) => tripletMap.get(key)!);
}
