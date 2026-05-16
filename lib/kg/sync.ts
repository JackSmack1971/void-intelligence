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
    // Ingress parameter guards
    if (!passphrase || !passphrase.trim()) {
      throw new Error("Passphrase is required for trail export.");
    }
    if (!triplets || triplets.length === 0) {
      throw new Error("Cannot export empty trail.");
    }

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
    // Ingress parameter guards
    if (!passphrase || !passphrase.trim()) {
      throw new Error("Passphrase is required for trail import.");
    }
    if (!encryptedB64 || !encryptedB64.trim()) {
      throw new Error("Encrypted payload is required.");
    }

    const decrypted = await decryptData(encryptedB64, passphrase);
    let payload: any;
    
    try {
      payload = JSON.parse(decrypted);
    } catch (e) {
      throw new Error("Decryption succeeded but payload is not a valid JSON structure.");
    }

    // Decrypted payload schema integrity validation
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid trail structure.");
    }
    if (typeof payload.version !== "string") {
      throw new Error("Payload missing version.");
    }
    if (!Array.isArray(payload.triplets)) {
      throw new Error("Payload missing triplets list.");
    }

    return payload as TrailPayload;
  }

  /**
   * Compare incoming triplets with existing ones to find new items and conflicts.
   */
  static async diffTriplets(incoming: Triplet[], existing: Triplet[]) {
    const newItems: Triplet[] = [];
    const overlaps: Triplet[] = [];
    
    // Canonical matching key helper to support case-insensitive and trimmed overlap diffs
    const canonicalKey = (t: Triplet) => 
      t && t.subject && t.predicate && t.object
        ? `${t.subject.trim().toLowerCase()}-${t.predicate.trim().toLowerCase()}-${t.object.trim().toLowerCase()}`
        : "";

    const existingKeys = new Set(
      (existing || [])
        .filter(t => t && t.subject && t.predicate && t.object)
        .map(canonicalKey)
    );

    for (const t of incoming) {
      if (!t || !t.subject || !t.predicate || !t.object) continue;
      const key = canonicalKey(t);
      if (existingKeys.has(key)) {
        overlaps.push(t);
      } else {
        newItems.push(t);
      }
    }

    return { newItems, overlaps };
  }
}
