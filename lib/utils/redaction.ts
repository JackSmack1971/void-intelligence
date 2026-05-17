/**
 * Regex-based PII masking utility
 */

const PATTERNS = {
  API_KEY: /(sk-[a-zA-Z0-9]{32,}|AIza[a-zA-Z0-9_-]{35})/g,
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  SSN: /\d{3}-\d{2}-\d{4}/g,
  PHONE: /(?:\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g,
  IP_ADDRESS: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
  CREDIT_CARD: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
};

export function redactPII(text: string): { redactedText: string; map: Record<string, string> } {
  let redactedText = text;
  const map: Record<string, string> = {};
  let counter = 0;

  for (const [key, pattern] of Object.entries(PATTERNS)) {
    redactedText = redactedText.replace(pattern, (match) => {
      const placeholder = `[REDACTED_${key}_${counter++}]`;
      map[placeholder] = match;
      return placeholder;
    });
  }

  return { redactedText, map };
}

export function restorePII(text: string, map: Record<string, string>): string {
  let restoredText = text;
  for (const [placeholder, original] of Object.entries(map)) {
    restoredText = restoredText.split(placeholder).join(original);
  }
  return restoredText;
}
