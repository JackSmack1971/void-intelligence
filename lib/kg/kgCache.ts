import { LRUCache } from "lru-cache";
import { Triplet } from "./extraction";

/**
 * Cache for Knowledge Graph triplets to reduce database I/O.
 */
const options = {
  max: 500, // Maximum items in cache
  ttl: 1000 * 60 * 10, // 10 minutes time-to-live
};

const cache = new LRUCache<string, Triplet[]>(options);

export function getCache(key: string): Triplet[] | undefined {
  return cache.get(key);
}

export function setCache(key: string, triplets: Triplet[]): void {
  cache.set(key, triplets);
}

export function clearCache(): void {
  cache.clear();
}
