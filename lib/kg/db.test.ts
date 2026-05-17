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

  it('should atomically replace triplets', async () => {
    // Setup initial data
    const initial = [
      { subject: 'S1', predicate: 'P1', object: 'O1' },
      { subject: 'S2', predicate: 'P2', object: 'O2' }
    ];
    await storeTriplets(initial);

    // Prepare replace diff
    const added = [
      { subject: 'S3', predicate: 'P3', object: 'O3' }
    ];
    const modified = [
      {
        original: { subject: 'S1', predicate: 'P1', object: 'O1' },
        updated: { subject: 'S1', predicate: 'P1', object: 'O1-new' }
      }
    ];

    const { replaceTriplets } = await import('./db');
    await replaceTriplets(added, modified);

    const after = await getAllTriplets();
    
    // Check that original S1->P1->O1 is deleted
    expect(after.some(t => t.subject === 'S1' && t.predicate === 'P1' && t.object === 'O1')).toBe(false);
    // Check that updated S1->P1->O1-new is inserted
    expect(after.some(t => t.subject === 'S1' && t.predicate === 'P1' && t.object === 'O1-new')).toBe(true);
    // Check that S2->P2->O2 remains unchanged
    expect(after.some(t => t.subject === 'S2' && t.predicate === 'P2' && t.object === 'O2')).toBe(true);
    // Check that S3->P3->O3 is added
    expect(after.some(t => t.subject === 'S3' && t.predicate === 'P3' && t.object === 'O3')).toBe(true);
  });
});
