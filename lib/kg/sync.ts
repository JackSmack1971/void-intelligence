import { KnowledgeTriplet as Triplet } from "../goa/types";
import { encryptData, decryptData } from "../utils/crypto";

export interface TrailPayload {
  version: string;
  timestamp: number;
  triplets: Triplet[];
  threadId?: string;
}

/**
 * Orchestrates the export and import of intelligence trails.
 */
export class SyncService {
  /**
   * Export a set of triplets as an encrypted .void file.
   */
  static async exportTrail(triplets: Triplet[], passphrase: string): Promise<string> {
    const payload: TrailPayload = {
      version: "1.4",
      timestamp: Date.now(),
      triplets,
    };

    const encrypted = await encryptData(JSON.stringify(payload), passphrase);
    return encrypted;
  }

  /**
   * Decrypt an incoming trail and return the payload.
   */
  static async decryptTrail(encryptedB64: string, passphrase: string): Promise<TrailPayload> {
    const decrypted = await decryptData(encryptedB64, passphrase);
    return JSON.parse(decrypted) as TrailPayload;
  }

  /**
   * Compare incoming triplets with existing ones to find new items and conflicts.
   */
  static async diffTriplets(incoming: Triplet[], existing: Triplet[]) {
    const newItems: Triplet[] = [];
    const overlaps: Triplet[] = [];
    
    const existingKeys = new Set(existing.map(t => `${t.subject}-${t.predicate}-${t.object}`));

    for (const t of incoming) {
      const key = `${t.subject}-${t.predicate}-${t.object}`;
      if (existingKeys.has(key)) {
        overlaps.push(t);
      } else {
        newItems.push(t);
      }
    }

    return { newItems, overlaps };
  }
}
