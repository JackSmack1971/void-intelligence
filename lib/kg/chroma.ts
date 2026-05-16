import { ChromaClient } from "chromadb";
import { KnowledgeTriplet as Triplet } from "../goa/types";

const client = new ChromaClient({ path: "http://localhost:8000" });

export class VectorStore {
  private static instance: VectorStore;
  private static initPromise: Promise<VectorStore> | null = null;
  
  private collectionName = "void_triplets";
  private isConnected = false;

  private constructor() {}

  /**
   * Enforces asynchronous thread-safety with static promise lock
   */
  public static async getInstance(): Promise<VectorStore> {
    if (!VectorStore.initPromise) {
      const store = new VectorStore();
      VectorStore.initPromise = store.init().then(() => {
        VectorStore.instance = store;
        return store;
      });
    }
    return VectorStore.initPromise;
  }

  private async init() {
    try {
      // Ensure collection exists
      await client.getOrCreateCollection({
        name: this.collectionName,
      });
      this.isConnected = true;
      console.log(`[Chroma] Initialized collection: ${this.collectionName}`);
    } catch (error) {
      this.isConnected = false;
      console.error("[Chroma] Initialization failed. Is Docker running?", error);
    }
  }

  public async upsertTriplets(triplets: Triplet[]) {
    // Short-circuit if disconnected or input is empty
    if (!this.isConnected || !triplets || triplets.length === 0) {
      return;
    }

    try {
      const collection = await client.getCollection({ name: this.collectionName });
      const ids = triplets.map(t => `${t.subject}-${t.predicate}-${t.object}`);
      const documents = triplets.map(t => `${t.subject} ${t.predicate} ${t.object}`);
      const metadatas = triplets.map(t => ({ subject: t.subject, predicate: t.predicate, object: t.object }));

      await collection.upsert({
        ids,
        documents,
        metadatas,
      });
    } catch (error) {
      // Gracefully track connection failure to avoid repeated timeouts
      this.isConnected = false;
      console.warn("[Chroma] Upsert failed.", error);
    }
  }

  public async querySemantic(query: string, limit: number = 10): Promise<Triplet[]> {
    // Short-circuit if query is empty/whitespace or client is disconnected
    if (!this.isConnected || !query || !query.trim()) {
      return [];
    }

    try {
      const collection = await client.getCollection({ name: this.collectionName });
      const results = await collection.query({
        queryTexts: [query],
        nResults: limit,
      });

      if (!results.metadatas || results.metadatas.length === 0) return [];

      return (results.metadatas[0] as any[]).map(meta => ({
        subject: meta.subject,
        predicate: meta.predicate,
        object: meta.object,
      }));
    } catch (error) {
      // Gracefully track connection failure to avoid repeated timeouts
      this.isConnected = false;
      console.warn("[Chroma] Query failed. Falling back to SQLite only.", error);
      return [];
    }
  }
}
