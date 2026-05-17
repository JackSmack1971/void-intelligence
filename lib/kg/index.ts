import { initDb, storeTriplets, getRelevantMemory, storeMessage, getAllTriplets } from "./db";
import { extractionQueue } from "./queue";
import { KnowledgeTriplet as Triplet } from "../goa/types";
import { getHybridMemory } from "./hybridRetriever";

// Public Barrel Exports
export { SyncService } from "./sync";
export type { TrailPayload, TripletDiff } from "./sync";
export { getHybridMemory } from "./hybridRetriever";
export { initDb, storeTriplets, getAllTriplets, getRelevantMemory };

export class KnowledgeGraph {
  private static instance: KnowledgeGraph;

  private constructor() {}

  static async getInstance(): Promise<KnowledgeGraph> {
    if (!KnowledgeGraph.instance) {
      KnowledgeGraph.instance = new KnowledgeGraph();
      await initDb();
    }
    return KnowledgeGraph.instance;
  }

  /**
   * High-level entry point for ingesting chat transcripts into the KG.
   * Handles debouncing and background extraction automatically with strict ingress guards.
   */
  ingestTranscript(threadId: string, transcript: string) {
    if (!threadId || !threadId.trim()) {
      throw new Error("Invalid threadId provided for transcript ingestion.");
    }
    if (!transcript || !transcript.trim()) {
      throw new Error("Empty transcript content provided for ingestion.");
    }
    extractionQueue.enqueue(threadId, transcript);
  }

  /**
   * Retrieve relevant knowledge for a query using hybrid retrieval with parameter guards.
   */
  async query(query: string, keywords: string[]): Promise<Triplet[]> {
    if (!query || !query.trim()) {
      throw new Error("Empty query string provided to Knowledge Graph retrieval.");
    }
    return getHybridMemory(query, keywords || []);
  }

  /**
   * Persist a chat message to history with defensive invariants.
   */
  async recordMessage(threadId: string, role: string, content: string) {
    if (!threadId || !threadId.trim()) {
      throw new Error("Invalid threadId provided for recordMessage.");
    }
    if (!role || !role.trim()) {
      throw new Error("Invalid role provided for recordMessage.");
    }
    if (!content || !content.trim()) {
      throw new Error("Empty message content provided for recordMessage.");
    }
    await storeMessage(threadId, role, content);
  }

  /**
   * For visualization tools.
   */
  async dump(): Promise<Triplet[]> {
    return getAllTriplets();
  }
}
