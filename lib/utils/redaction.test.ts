import { describe, it, expect } from 'vitest';
import { redactPII, restorePII } from './redaction';

describe('PII Redaction', () => {
  it('should redact emails', () => {
    const text = 'Contact me at test@example.com';
    const { redactedText, map } = redactPII(text);
    expect(redactedText).toContain('[REDACTED_EMAIL_0]');
    expect(redactedText).not.toContain('test@example.com');
    expect(restorePII(redactedText, map)).toBe(text);
  });

  it('should redact phone numbers', () => {
    const text = 'Call 123-456-7890';
    const { redactedText, map } = redactPII(text);
    expect(redactedText).toContain('[REDACTED_PHONE_0]');
    expect(restorePII(redactedText, map)).toBe(text);
  });

  it('should redact API keys', () => {
    const text = 'My key is sk-1234567890abcdef1234567890abcdef';
    const { redactedText, map } = redactPII(text);
    expect(redactedText).toContain('[REDACTED_API_KEY_0]');
    expect(restorePII(redactedText, map)).toBe(text);
  });

  it('should redact SSNs', () => {
    const text = 'My SSN is 000-12-3456';
    const { redactedText, map } = redactPII(text);
    expect(redactedText).toContain('[REDACTED_SSN_0]');
    expect(restorePII(redactedText, map)).toBe(text);
  });

  it('should redact IP addresses', () => {
    const text = 'Server address is 192.168.1.100';
    const { redactedText, map } = redactPII(text);
    expect(redactedText).toContain('[REDACTED_IP_ADDRESS_0]');
    expect(restorePII(redactedText, map)).toBe(text);
  });

  it('should redact Credit Card numbers', () => {
    const text = 'Charged to card 4111-2222-3333-4444';
    const { redactedText, map } = redactPII(text);
    expect(redactedText).toContain('[REDACTED_CREDIT_CARD_0]');
    expect(restorePII(redactedText, map)).toBe(text);
  });

  it('should handle multiple PII types in the same string', () => {
    const text = 'My email is a@b.com and key is sk-1234567890abcdef1234567890abcdef. Call 555-555-5555.';
    const { redactedText, map } = redactPII(text);
    
    expect(redactedText).toContain('[REDACTED_API_KEY_0]');
    expect(redactedText).toContain('[REDACTED_EMAIL_1]');
    expect(redactedText).toContain('[REDACTED_PHONE_2]');
    expect(restorePII(redactedText, map)).toBe(text);
  });
});
