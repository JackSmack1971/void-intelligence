import { describe, it, expect } from "vitest";
import { SyncService } from "./sync";

describe("SyncService [RED]", () => {
  const sampleTriplets = [{ subject: "agent", predicate: "uses", object: "tools" }];
  const passphrase = "secure-key-123";

  it("should successfully encrypt and decrypt a roundtrip trail payload", async () => {
    const encrypted = await SyncService.exportTrail(sampleTriplets, passphrase);
    expect(typeof encrypted).toBe("string");
    expect(encrypted.length).toBeGreaterThan(0);

    const decrypted = await SyncService.decryptTrail(encrypted, passphrase);
    expect(decrypted.version).toBe("1.4");
    expect(decrypted.triplets).toEqual(sampleTriplets);
  });

  it("should detect overlaps case-insensitively and with space-trimming inside diffTriplets", async () => {
    const incoming = [{ subject: "  Agent  ", predicate: "Uses", object: "Tools" }];
    const existing = [{ subject: "agent", predicate: "uses", object: "tools" }];

    const { newItems, overlaps } = await SyncService.diffTriplets(incoming, existing);
    expect(overlaps).toEqual(incoming);
    expect(newItems).toEqual([]);
  });

  it("should throw a validation error on empty passphrases during export and import", async () => {
    await expect(SyncService.exportTrail(sampleTriplets, "")).rejects.toThrow();
    await expect(SyncService.exportTrail(sampleTriplets, "   ")).rejects.toThrow();

    await expect(SyncService.decryptTrail("some-payload", "")).rejects.toThrow();
  });

  it("should throw a validation error on empty triplets during export", async () => {
    await expect(SyncService.exportTrail([], passphrase)).rejects.toThrow();
    await expect(SyncService.exportTrail(null as any, passphrase)).rejects.toThrow();
  });

  it("should throw a schema integrity error if decrypted payload has missing or corrupted fields", async () => {
    const { encryptData } = await import("../utils/crypto");
    
    // Corrupted payload missing "version" or "triplets"
    const badPayload1 = { version: "1.4" }; // missing triplets
    const badPayload2 = { triplets: sampleTriplets }; // missing version
    const badPayload3 = "not-even-json";

    const enc1 = await encryptData(JSON.stringify(badPayload1), passphrase);
    const enc2 = await encryptData(JSON.stringify(badPayload2), passphrase);
    const enc3 = await encryptData(badPayload3, passphrase);

    await expect(SyncService.decryptTrail(enc1, passphrase)).rejects.toThrow();
    await expect(SyncService.decryptTrail(enc2, passphrase)).rejects.toThrow();
    await expect(SyncService.decryptTrail(enc3, passphrase)).rejects.toThrow();
  });

  it("should classify incoming triplets correctly into added, modified, and overlaps categories in diffTripletsDelta", async () => {
    const incoming = [
      { subject: "Agent", predicate: "uses", object: "Tools" }, // Overlap (case-insensitive & trimmed match)
      { subject: "Agent", predicate: "performs", object: "Tasks" }, // Modified SP
      { subject: "Model", predicate: "knows", object: "Data" }, // Modified SO
      { subject: "NewConcept", predicate: "is", object: "Discovered" } // Added
    ];

    const existing = [
      { subject: "  agent  ", predicate: "USES", object: "tools  " },
      { subject: "Agent", predicate: "performs", object: "Jobs" },
      { subject: "Model", predicate: "has", object: "Data" }
    ];

    const { added, modified, overlaps } = await SyncService.diffTripletsDelta(incoming, existing);

    expect(overlaps).toHaveLength(1);
    expect(overlaps[0]).toEqual(incoming[0]);

    expect(modified).toHaveLength(2);
    expect(modified).toContainEqual({
      original: existing[1],
      updated: incoming[1]
    });
    expect(modified).toContainEqual({
      original: existing[2],
      updated: incoming[2]
    });

    expect(added).toHaveLength(1);
    expect(added[0]).toEqual(incoming[3]);
  });
});
