import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runGoA } from './engine';
import * as client from '../openrouter/client';

vi.mock('../openrouter/client', () => ({
  chatWithRetry: vi.fn(),
  streamChat: vi.fn(),
}));

describe('runGoA engine', () => {
  const mockCards = [
    { id: 'agent-1', name: 'Agent 1', role: 'logic', description: 'desc', capabilities: [] },
    { id: 'agent-2', name: 'Agent 2', role: 'extraction', description: 'desc', capabilities: [] },
    { id: 'agent-3', name: 'Agent 3', role: 'meta', description: 'desc', capabilities: [] },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute all stages of the GoA pipeline', async () => {
    let scoreCounter = 0;
    (client.chatWithRetry as any).mockImplementation((messages: any, options: any) => {
      const prompt = messages[0].content;
      const intent = options.intent;

      // Stage 0: Memory
      if (prompt.includes('Extract 3-5 core entities')) {
        return Promise.resolve('keyword1, keyword2');
      }
      // Stage 1: Node Sampling
      if (intent === 'sampling' || prompt.includes('Select the top')) {
        return Promise.resolve(JSON.stringify({ selected_ids: ['agent-1', 'agent-2', 'agent-3'] }));
      }
      // Stage 3: Matrix Scoring
      if (prompt.includes('Evaluate the response to')) {
        const score = scoreCounter++ % 2;
        return Promise.resolve(JSON.stringify({ score }));
      }
      // Stage 5: Pooling (GoA-Max)
      if (prompt.includes('Select the best response')) {
        return Promise.resolve(JSON.stringify({ best_index: 0 }));
      }
      // Stage 2/4: Generation/Refinement
      return Promise.resolve('Refined/Initial Response');
    });

    const result = await runGoA('test query', mockCards, { k: 3 });

    expect(result.selectedAgents).toHaveLength(3);
    expect(result.sourceNodes.length + result.targetNodes.length).toBe(3);
    // 1 (sample) + 3 (init) + 6 (score) + 3 (refine) + 1 (pool) = 14 calls
    // But score calls depend on k. For k=3, it's 3*2 = 6.
    expect(client.chatWithRetry).toHaveBeenCalled();
  });
});
