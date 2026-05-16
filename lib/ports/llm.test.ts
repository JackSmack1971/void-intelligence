import { describe, it, expect, vi } from 'vitest';
import { LLMProvider } from './llm';

describe('LLM Port', () => {
  it('should allow plugging in a custom provider', async () => {
    const customProvider: LLMProvider = {
      chat: vi.fn().mockResolvedValue('Custom Response'),
      stream: vi.fn(),
    };

    const response = await customProvider.chat([{ role: 'user', content: 'hello' }]);
    expect(response).toBe('Custom Response');
    expect(customProvider.chat).toHaveBeenCalledWith([{ role: 'user', content: 'hello' }]);
  });
});
