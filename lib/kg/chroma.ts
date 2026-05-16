import { ChromaClient } from "chromadb";
import { KnowledgeTriplet as Triplet } from "../goa/types";

const client = new ChromaClient({ path: "http://localhost:8000" });

export class VectorStore {
  private static instance: VectorStore;
  private collectionName = "void_triplets";

  private constructor() {}

  public static async getInstance(): Promise<VectorStore> {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
      await VectorStore.instance.init();
    }
    return VectorStore.instance;
  }

  private async init() {
    try {
      // Ensure collection exists
      await client.getOrCreateCollection({
        name: this.collectionName,
      });
      console.log(`[Chroma] Initialized collection: ${this.collectionName}`);
    } catch (error) {
      console.error("[Chroma] Initialization failed. Is Docker running?", error);
    }
  }

  public async upsertTriplets(triplets: Triplet[]) {
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
      console.warn("[Chroma] Upsert failed.", error);
    }
  }

  public async querySemantic(query: string, limit: number = 10): Promise<Triplet[]> {
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
      console.warn("[Chroma] Query failed. Falling back to SQLite only.", error);
      return [];
    }
  }
}
