import { extractTriplets } from "./extraction";
import { storeTriplets } from "./db";
import { runConsolidation } from "./consolidation";

/**
 * Singleton queue for Knowledge Graph extraction with debouncing.
 * Prevents redundant LLM calls during rapid-fire messaging.
 */
class ExtractionQueue {
  private static instance: ExtractionQueue;
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private transcripts: Map<string, string> = new Map();
  private extractionCount: number = 0;

  private constructor() {}

  static getInstance(): ExtractionQueue {
    if (!ExtractionQueue.instance) {
      ExtractionQueue.instance = new ExtractionQueue();
    }
    return ExtractionQueue.instance;
  }

  /**
   * Enqueue a transcript for extraction.
   * Resets the 5-second debounce timer if already pending.
   */
  enqueue(threadId: string, transcript: string) {
    console.log(`[Queue] Enqueueing extraction for thread: ${threadId}`);
    
    // Clear existing timer for this thread
    if (this.timers.has(threadId)) {
      clearTimeout(this.timers.get(threadId));
    }

    // Accumulate transcript (or just use the latest full transcript)
    this.transcripts.set(threadId, transcript);

    // Set new timer
    const timer = setTimeout(async () => {
      await this.process(threadId);
    }, 5000);

    this.timers.set(threadId, timer);
  }

  private async process(threadId: string) {
    const transcript = this.transcripts.get(threadId);
    if (!transcript) return;

    console.log(`[Queue] Starting extraction for thread: ${threadId} (Debounce complete)`);
    this.timers.delete(threadId);
    this.transcripts.delete(threadId);

    try {
      const triplets = await extractTriplets(transcript);
      if (triplets.length > 0) {
        console.log(`[Queue] Successfully extracted ${triplets.length} triplets for thread: ${threadId}`);
        await storeTriplets(triplets);
        
        this.extractionCount++;
        // Trigger consolidation after every 3 extractions (lowered for demo visibility)
        if (this.extractionCount % 3 === 0) {
          await runConsolidation();
        }
      } else {
        console.log(`[Queue] No triplets found for thread: ${threadId}`);
      }
    } catch (err) {
      console.error(`[Queue] Extraction failed for thread: ${threadId}:`, err);
    }
  }
}

export const extractionQueue = ExtractionQueue.getInstance();
