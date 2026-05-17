import { describe, it, expect } from "vitest";
import { deriveKey, encryptData, decryptData } from "./crypto";

describe("Cryptographic Data Masking", () => {
  const passphrase = "super-secret-key-123!";
  const data = "System Status: Void Engine Operational";

  it("should successfully derive key using PBKDF2 parameters", async () => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(passphrase, salt);
    expect(key).toBeDefined();
    expect(key.algorithm.name).toBe("AES-GCM");
  });

  it("should encrypt and decrypt data matching original content perfectly", async () => {
    const encrypted = await encryptData(data, passphrase);
    expect(encrypted).toBeDefined();
    expect(typeof encrypted).toBe("string");
    expect(encrypted).not.toBe(data);

    const decrypted = await decryptData(encrypted, passphrase);
    expect(decrypted).toBe(data);
  });

  it("should fail decryption when using an incorrect passphrase", async () => {
    const encrypted = await encryptData(data, passphrase);
    await expect(decryptData(encrypted, "wrong-passphrase")).rejects.toThrow();
  });
});
