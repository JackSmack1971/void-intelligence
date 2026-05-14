import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatWithRetry, streamChat } from './client';

describe('chatWithRetry', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    process.env.OPENROUTER_API_KEY = 'test-key';
  });

  it('should return content on successful first attempt', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'Hello' } }]
      })
    };
    (fetch as any).mockResolvedValue(mockResponse);

    const result = await chatWithRetry([{ role: 'user', content: 'hi' }], { model: 'test' });
    expect(result).toBe('Hello');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on 429 Rate Limit error', async () => {
    const rateLimitResponse = {
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: 'Rate limit' })
    };
    const successResponse = {
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'Recovered' } }]
      })
    };

    (fetch as any)
      .mockResolvedValueOnce(rateLimitResponse)
      .mockResolvedValueOnce(successResponse);

    // Mock console.warn and setTimeout to avoid delays in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(global, 'setTimeout').mockImplementation((cb: any) => cb());

    const result = await chatWithRetry([{ role: 'user', content: 'hi' }], { model: 'test' });
    expect(result).toBe('Recovered');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should throw after max retries', async () => {
    const rateLimitResponse = {
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: 'Rate limit' })
    };
    (fetch as any).mockResolvedValue(rateLimitResponse);

    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(global, 'setTimeout').mockImplementation((cb: any) => cb());

    await expect(chatWithRetry([{ role: 'user', content: 'hi' }], { model: 'test' }, 2))
      .rejects.toThrow('Rate limit exceeded on OpenRouter free tier');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe('streamChat', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    process.env.OPENROUTER_API_KEY = 'test-key';
  });

  it('should call onToken for each received token in SSE stream', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"choices": [{"delta": {"content": "Hello"}}]}\n\n'));
        controller.enqueue(new TextEncoder().encode('data: {"choices": [{"delta": {"content": " world"}}]}\n\n'));
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      }
    });

    const mockResponse = {
      ok: true,
      body: mockStream
    };
    (fetch as any).mockResolvedValue(mockResponse);

    const tokens: string[] = [];
    await streamChat([{ role: 'user', content: 'hi' }], { model: 'test' }, (t) => tokens.push(t));

    expect(tokens).toEqual(['Hello', ' world']);
  });
});
