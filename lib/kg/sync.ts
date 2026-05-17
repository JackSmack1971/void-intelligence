import { KnowledgeTriplet as Triplet } from "../goa/types";
import { encryptData, decryptData } from "../utils/crypto";

export interface TrailPayload {
  version: string;
  timestamp: number;
  triplets: Triplet[];
  threadId?: string;
}

export interface TripletDiff {
  added: Triplet[];
  modified: { original: Triplet; updated: Triplet }[];
  overlaps: Triplet[];
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

  /**
   * Compare incoming triplets with existing ones to find added, modified, and overlapping items.
   */
  static async diffTripletsDelta(incoming: Triplet[], existing: Triplet[]): Promise<TripletDiff> {
    const added: Triplet[] = [];
    const modified: { original: Triplet; updated: Triplet }[] = [];
    const overlaps: Triplet[] = [];

    const canonicalKey = (t: Triplet) => 
      t && t.subject && t.predicate && t.object
        ? `${t.subject.trim().toLowerCase()}-${t.predicate.trim().toLowerCase()}-${t.object.trim().toLowerCase()}`
        : "";

    const spKey = (t: Triplet) =>
      t && t.subject && t.predicate
        ? `${t.subject.trim().toLowerCase()}-${t.predicate.trim().toLowerCase()}`
        : "";

    const soKey = (t: Triplet) =>
      t && t.subject && t.object
        ? `${t.subject.trim().toLowerCase()}-${t.object.trim().toLowerCase()}`
        : "";

    const existingKeys = new Set(
      (existing || [])
        .filter(t => t && t.subject && t.predicate && t.object)
        .map(canonicalKey)
    );

    // Build lookup maps for existing items to match modified cases
    const existingSP = new Map<string, Triplet[]>();
    const existingSO = new Map<string, Triplet[]>();

    for (const t of existing || []) {
      if (!t || !t.subject || !t.predicate || !t.object) continue;
      
      const sp = spKey(t);
      if (!existingSP.has(sp)) existingSP.set(sp, []);
      existingSP.get(sp)!.push(t);

      const so = soKey(t);
      if (!existingSO.has(so)) existingSO.set(so, []);
      existingSO.get(so)!.push(t);
    }

    for (const t of incoming || []) {
      if (!t || !t.subject || !t.predicate || !t.object) continue;
      
      const full = canonicalKey(t);
      if (existingKeys.has(full)) {
        overlaps.push(t);
        continue;
      }

      // Check if this is a modification of an existing triplet
      const sp = spKey(t);
      const so = soKey(t);
      
      let matchedOriginal: Triplet | null = null;

      // 1. Prioritize same Subject-Predicate, different Object
      if (existingSP.has(sp)) {
        const candidates = existingSP.get(sp)!;
        const match = candidates.find(
          c => c.object.trim().toLowerCase() !== t.object.trim().toLowerCase()
        );
        if (match) {
          matchedOriginal = match;
        }
      }

      // 2. Fall back to same Subject-Object, different Predicate
      if (!matchedOriginal && existingSO.has(so)) {
        const candidates = existingSO.get(so)!;
        const match = candidates.find(
          c => c.predicate.trim().toLowerCase() !== t.predicate.trim().toLowerCase()
        );
        if (match) {
          matchedOriginal = match;
        }
      }

      if (matchedOriginal) {
        modified.push({ original: matchedOriginal, updated: t });
      } else {
        added.push(t);
      }
    }

    return { added, modified, overlaps };
  }
}
