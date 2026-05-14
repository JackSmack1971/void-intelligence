import { createClient } from "@libsql/client";
import { Triplet } from "./extraction";

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

/**
 * Store extracted triplets
 */
export async function storeTriplets(triplets: Triplet[]) {
  for (const t of triplets) {
    await client.execute({
      sql: "INSERT INTO triplets (subject, predicate, object) VALUES (?, ?, ?)",
      args: [t.subject, t.predicate, t.object],
    });
  }
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

  // Build OR conditions for all keywords
  const conditions = keywords.map(() => "subject LIKE ? OR object LIKE ?").join(" OR ");
  const args = keywords.flatMap(k => [`%${k}%`, `%${k}%`]);

  const query = `
    WITH direct_matches AS (
      SELECT subject, predicate, object, timestamp
      FROM triplets
      WHERE ${conditions}
    )
    SELECT subject, predicate, object FROM direct_matches
    UNION
    SELECT t.subject, t.predicate, t.object
    FROM triplets t
    JOIN direct_matches dm ON (t.subject = dm.object OR t.object = dm.subject)
    ORDER BY t.timestamp DESC
    LIMIT 15
  `;

  const result = await client.execute({ sql: query, args });
  
  return result.rows.map(row => ({
    subject: row.subject as string,
    predicate: row.predicate as string,
    object: row.object as string,
  }));
}

/**
 * Delete a triplet
 */
export async function deleteTriplet(subject: string, predicate: string, object: string) {
  await client.execute({
    sql: "DELETE FROM triplets WHERE subject = ? AND predicate = ? AND object = ?",
    args: [subject, predicate, object],
  });
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
