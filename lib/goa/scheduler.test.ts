import { describe, it, expect } from 'vitest';
import { DebateScheduler } from './scheduler';

describe('DebateScheduler', () => {
  it('should compute waves correctly for a simple chain', () => {
    const agents = ['A', 'B', 'C'];
    const matrix = {
      'A': { 'B': 1 },
      'B': { 'C': 1 },
      'C': {}
    };
    // B depends on A, C depends on B.
    // Waves should be: [A], [B], [C]
    const waves = DebateScheduler.computeWaves(agents, matrix as any);
    expect(waves).toEqual([['A'], ['B'], ['C']]);
  });

  it('should compute waves correctly for parallel experts', () => {
    const agents = ['A', 'B', 'C'];
    const matrix = {
      'A': { 'C': 1 },
      'B': { 'C': 1 },
      'C': {}
    };
    // C depends on A and B. A and B are independent.
    // Waves should be: [A, B], [C]
    const waves = DebateScheduler.computeWaves(agents, matrix as any);
    expect(waves).toHaveLength(2);
    expect(waves[0]).toContain('A');
    expect(waves[0]).toContain('B');
    expect(waves[1]).toEqual(['C']);
  });

  it('should handle cycles by putting leftovers in a final wave', () => {
    const agents = ['A', 'B'];
    const matrix = {
      'A': { 'B': 1 },
      'B': { 'A': 1 }
    };
    // Cycle: A depends on B, B depends on A.
    // Kahn's will stop immediately.
    const waves = DebateScheduler.computeWaves(agents, matrix as any);
    expect(waves).toHaveLength(1);
    expect(waves[0]).toContain('A');
    expect(waves[0]).toContain('B');
  });

  it('should support sparse matrices [BEH-1]', () => {
    const agents = ['A', 'B', 'C'];
    const matrix = {
      'A': { 'B': 1 }
      // C is missing from matrix keys
    };
    const waves = DebateScheduler.computeWaves(agents, matrix as any);
    // A and C should be in wave 0, B in wave 1
    expect(waves).toHaveLength(2);
    expect(waves[0]).toContain('A');
    expect(waves[0]).toContain('C');
    expect(waves[1]).toEqual(['B']);
  });

  it('should ensure deterministic wave ordering [BEH-2]', () => {
    const agents = ['B', 'A', 'C'];
    const matrix = {};
    const waves = DebateScheduler.computeWaves(agents, matrix as any);
    // Should be sorted alphabetically: [A, B, C]
    expect(waves[0]).toEqual(['A', 'B', 'C']);
  });
});
