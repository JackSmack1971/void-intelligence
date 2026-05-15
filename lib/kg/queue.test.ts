import { extractionQueue } from './queue';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./extraction', () => ({
  extractTriplets: vi.fn().mockResolvedValue([{ subject: 'test', predicate: 'is', object: 'working' }]),
}));

vi.mock('./db', () => ({
  storeTriplets: vi.fn().mockResolvedValue(true),
}));

describe('ExtractionQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  it('should debounce multiple calls and only process once', async () => {
    const { extractTriplets } = await import('./extraction');
    
    extractionQueue.enqueue('thread-1', 'transcript 1');
    vi.advanceTimersByTime(2000);
    
    extractionQueue.enqueue('thread-1', 'transcript 2');
    vi.advanceTimersByTime(2000);
    
    extractionQueue.enqueue('thread-1', 'transcript 3');
    vi.advanceTimersByTime(6000); // Trigger!

    expect(extractTriplets).toHaveBeenCalledTimes(1);
    expect(extractTriplets).toHaveBeenCalledWith('transcript 3');
  });

  it('should handle different threads independently', async () => {
    const { extractTriplets } = await import('./extraction');
    
    extractionQueue.enqueue('thread-1', 'transcript A');
    extractionQueue.enqueue('thread-2', 'transcript B');
    
    vi.advanceTimersByTime(6000);

    expect(extractTriplets).toHaveBeenCalledTimes(2);
  });
});
