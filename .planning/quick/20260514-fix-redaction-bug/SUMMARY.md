---
status: complete
---
# Quick Task Summary: Fix PII Redaction Bug

## Problem
The `PHONE` regex pattern was too broad, causing it to match digit sequences inside OpenRouter API keys. Since `PHONE` had higher priority than `API_KEY`, it was corrupting the redaction of keys.

## Solution
1. **Prioritized Patterns**: Reordered the `PATTERNS` object to ensure specific formats like `API_KEY` and `EMAIL` are processed before general patterns like `PHONE`.
2. **Refined Regex**: Updated the `PHONE` regex to require delimiters (spaces, dots, or hyphens) to prevent it from matching raw digit strings inside keys.

## Verification
- Ran `npx vitest run lib/utils/redaction.test.ts`
- Result: **All 3 tests passed** (Redaction/Restoration of Email, Phone, and API Key).
