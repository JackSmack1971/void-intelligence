import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractTriplets, EXTRACTION_PROMPT } from './extraction';
import * as client from '../openrouter/client';

vi.mock('../openrouter/client', () => ({
  chatWithRetry: vi.fn(),
}));

describe('extractTriplets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse valid JSON triplets from Owl Alpha', async () => {
    const mockJson = JSON.stringify({
      triplets: [
        { subject: 'Prime Numbers', predicate: 'used_in', object: 'RSA' },
        { subject: 'RSA', predicate: 'is_an', object: 'Encryption Algorithm' }
      ]
    });
    (client.chatWithRetry as any).mockResolvedValue(mockJson);

    const result = await extractTriplets('some transcript');
    expect(result).toHaveLength(2);
    expect(result[0].subject).toBe('Prime Numbers');
  });

  it('should return an empty array on malformed JSON', async () => {
    (client.chatWithRetry as any).mockResolvedValue('Not a JSON string');
    const result = await extractTriplets('some transcript');
    expect(result).toEqual([]);
  });

  it('should return an empty array if no triplets found', async () => {
    (client.chatWithRetry as any).mockResolvedValue(JSON.stringify({ triplets: [] }));
    const result = await extractTriplets('some transcript');
    expect(result).toEqual([]);
  });

  it('EXTRACTION_PROMPT should use ### headers [BEH-1]', () => {
    const prompt = EXTRACTION_PROMPT('test transcript');
    expect(prompt).toContain('### SYSTEM ROLE');
    expect(prompt).toContain('### TARGET TRANSCRIPT');
    expect(prompt).toContain('### EXTRACTION REQUIREMENTS');
    expect(prompt).toContain('### OUTPUT SCHEMA');
  });

  it('extractTriplets should short-circuit on empty input [BEH-3]', async () => {
    const result = await extractTriplets('   ');
    expect(result).toEqual([]);
    expect(client.chatWithRetry).not.toHaveBeenCalled();
  });
});
