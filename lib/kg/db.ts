import { createClient } from "@libsql/client";
import { Triplet } from "./extraction";
import { getCache, setCache } from "./kgCache";

// Initialize SQLite
const client = createClient({
  url: "file:void-intelligence.db",
});

/**
 * Initialize the database schema
 */
export async function initDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS triplets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      predicate TEXT NOT NULL,
      object TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

import { VectorStore } from "./chroma";

/**
 * Store extracted triplets using a single batch transaction and sync to Chroma.
 */
export async function storeTriplets(triplets: Triplet[]) {
  if (triplets.length === 0) return;
  
  const stmts = triplets.map(t => ({
    sql: "INSERT INTO triplets (subject, predicate, object) VALUES (?, ?, ?)",
    args: [t.subject, t.predicate, t.object],
  }));
  
  await client.batch(stmts, "write");

  // Sync to Chroma in background
  VectorStore.getInstance().then(v => v.upsertTriplets(triplets)).catch(e => console.warn("[Chroma] Sync failed", e));
}

/**
 * Retrieve all triplets for visualization
 */
export async function getAllTriplets(): Promise<Triplet[]> {
  const result = await client.execute("SELECT subject, predicate, object FROM triplets");
  return result.rows.map(row => ({
    subject: row.subject as string,
    predicate: row.predicate as string,
    object: row.object as string,
  }));
}

/**
 * Hybrid Retrieval: Keywords + 1-Hop Expansion
 * Finds direct matches and their immediate conceptual neighbors.
 */
export async function getRelevantMemory(keywords: string[]): Promise<Triplet[]> {
  if (keywords.length === 0) return [];

  const cacheKey = keywords.sort().join(",");
  const cached = getCache(cacheKey);
  if (cached) return cached;

  // Build OR conditions for all keywords
  const conditions = keywords.map(() => "subject LIKE ? OR object LIKE ?").join(" OR ");
  const args = keywords.flatMap(k => [`%${k}%`, `%${k}%`]);

  const query = `
    WITH direct_matches AS (
      SELECT subject, predicate, object, timestamp
      FROM triplets
      WHERE ${conditions}
    )
    SELECT subject, predicate, object, timestamp FROM direct_matches
    UNION
    SELECT t.subject, t.predicate, t.object, t.timestamp
    FROM triplets t
    JOIN direct_matches dm ON (t.subject = dm.object OR t.object = dm.subject)
    ORDER BY timestamp DESC
    LIMIT 15
  `;

  const result = await client.execute({ sql: query, args });
  const triplets = result.rows.map(row => ({
    subject: row.subject as string,
    predicate: row.predicate as string,
    object: row.object as string,
  }));

  setCache(cacheKey, triplets);
  return triplets;
}

/**
 * Retrieve a batch of triplets with IDs for consolidation
 */
export async function getConsolidationBatch(limit: number = 50): Promise<(Triplet & { id: number })[]> {
  const result = await client.execute({
    sql: "SELECT id, subject, predicate, object FROM triplets ORDER BY timestamp ASC LIMIT ?",
    args: [limit]
  });
  return result.rows.map(row => ({
    id: row.id as number,
    subject: row.subject as string,
    predicate: row.predicate as string,
    object: row.object as string,
  }));
}

/**
 * Atomicly swap old triplets for new consolidated ones.
 */
export async function consolidateTriplets(oldIds: number[], newTriplets: Triplet[]) {
  if (oldIds.length === 0) return;

  const deleteStmts = oldIds.map(id => ({
    sql: "DELETE FROM triplets WHERE id = ?",
    args: [id]
  }));

  const insertStmts = newTriplets.map(t => ({
    sql: "INSERT INTO triplets (subject, predicate, object) VALUES (?, ?, ?)",
    args: [t.subject, t.predicate, t.object]
  }));

  await client.batch([...deleteStmts, ...insertStmts], "write");

  // Note: For simplicity in this phase, we just upsert the new ones. 
  // In a production scenario, we should also track IDs to delete in Chroma.
  VectorStore.getInstance().then(v => v.upsertTriplets(newTriplets)).catch(e => console.warn("[Chroma] Consolidation sync failed", e));
}

/**
 * Delete a triplet
 */
export async function deleteTriplet(subject: string, predicate: string, object: string) {
  await client.execute({
    sql: "DELETE FROM triplets WHERE subject = ? AND predicate = ? AND object = ?",
    args: [subject, predicate, object],
  });
  // Optional: Sync delete to Chroma here if needed
}

/**
 * Store a chat message
 */
export async function storeMessage(threadId: string, role: string, content: string) {
  await client.execute({
    sql: "INSERT INTO messages (thread_id, role, content) VALUES (?, ?, ?)",
    args: [threadId, role, content],
  });
}
