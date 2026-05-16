import { initDb, storeTriplets, getRelevantMemory, storeMessage, getAllTriplets } from "./db";
import { extractionQueue } from "./queue";
import { KnowledgeTriplet as Triplet } from "../goa/types";
import { getHybridMemory } from "./hybridRetriever";

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
   * Handles debouncing and background extraction automatically.
   */
  ingestTranscript(threadId: string, transcript: string) {
    extractionQueue.enqueue(threadId, transcript);
  }



  /**
   * Retrieve relevant knowledge for a query using hybrid retrieval.
   */
  async query(query: string, keywords: string[]): Promise<Triplet[]> {
    return getHybridMemory(query, keywords);
  }

  /**
   * Persist a chat message to history.
   */
  async recordMessage(threadId: string, role: string, content: string) {
    await storeMessage(threadId, role, content);
  }

  /**
   * For visualization tools.
   */
  async dump(): Promise<Triplet[]> {
    return getAllTriplets();
  }
}
