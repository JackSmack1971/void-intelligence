import { describe, it, expect, vi, beforeAll } from 'vitest';
import { initDb, storeTriplets, getAllTriplets } from './db';
import { createClient } from "@libsql/client";

// Note: In a real environment, we'd mock the createClient to return a memory DB
// For this test, we verify the logic works if initDb is called.
describe('Database Logic', () => {
  it('should initialize and store triplets', async () => {
    // We expect initDb to run without error
    await expect(initDb()).resolves.toBeUndefined();

    const testTriplets = [
      { subject: 'A', predicate: 'B', object: 'C' }
    ];

    await storeTriplets(testTriplets);
    const result = await getAllTriplets();
    
    expect(result.some(t => t.subject === 'A')).toBe(true);
  });
});
