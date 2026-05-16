import { LRUCache } from "lru-cache";
import { KnowledgeTriplet as Triplet } from "../goa/types";

/**
 * Cache for Knowledge Graph triplets to reduce database I/O.
 */
const options = {
  max: 500, // Maximum items in cache
  ttl: 1000 * 60 * 10, // 10 minutes time-to-live
};

const cache = new LRUCache<string, Triplet[]>(options);

/**
 * Helper to normalize key by trimming and lowercasing.
 */
function normalizeKey(key: string): string {
  return (key || "").trim().toLowerCase();
}

export function getCache(key: string): Triplet[] | undefined {
  const normalized = normalizeKey(key);
  // Short-circuit if normalized key is empty
  if (!normalized) {
    return undefined;
  }
  return cache.get(normalized);
}

export function setCache(key: string, triplets: Triplet[]): void {
  const normalized = normalizeKey(key);
  // Short-circuit on empty key or empty triplets array
  if (!normalized || !triplets || triplets.length === 0) {
    return;
  }
  cache.set(normalized, triplets);
}

export function clearCache(): void {
  cache.clear();
}
