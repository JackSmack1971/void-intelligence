import { Triplet } from "./extraction";

const DB_NAME = "void_intelligence_local";
const STORE_NAME = "triplets";
const DB_VERSION = 1;

/**
 * Client-side persistence for the Knowledge Graph using IndexedDB.
 * Enables offline browsing and instant graph loading.
 */
export class LocalPersistence {
  private static instance: LocalPersistence;
  private db: IDBDatabase | null = null;

  private constructor() {}

  public static getInstance(): LocalPersistence {
    if (!LocalPersistence.instance) {
      LocalPersistence.instance = new LocalPersistence();
    }
    return LocalPersistence.instance;
  }

  private async getDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: ["subject", "predicate", "object"] });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve(this.db!);
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  }

  public async saveTriplets(triplets: Triplet[]): Promise<void> {
    const db = await this.getDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    for (const t of triplets) {
      store.put(t);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getAllTriplets(): Promise<Triplet[]> {
    const db = await this.getDb();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async clearAll(): Promise<void> {
    const db = await this.getDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
