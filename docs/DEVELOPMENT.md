# Development Guide

This document is for developers who want to modify or extend the Void Intelligence engine.

## Codebase Map

| Path | Purpose |
| :--- | :--- |
| `app/` | Next.js App Router (Layouts, Pages, Actions). |
| `components/` | React components (React Flow graph, Chat UI). |
| `lib/goa/` | The core Graph-of-Agents engine logic. |
| `lib/kg/` | Triplet extraction and SQLite persistence logic. |
| `lib/openrouter/` | API client with retry and streaming support. |
| `lib/utils/` | Shared utilities (PII redaction, styling helpers). |
| `docs/` | Project documentation. |

## Design System

The UI follows a **Cyber-Brutalist** aesthetic with **Glassmorphism** accents.

### Design Tokens (`lib/design-tokens.ts`)
We use a centralized token system for colors, typography, and spacing. 
- **Main Colors**: `#030712` (Background), `#2563EB` (Accent Blue), `#6D28D9` (Accent Purple).
- **Glass Effect**: `rgba(31, 41, 55, 0.5)` with `backdrop-blur`.

## Working with the GoA Engine

To add a new stage to the engine:
1.  Modify the `runGoA` function in `lib/goa/engine.ts`.
2.  Update the `onStatus` callbacks to inform the UI of the new stage.
3.  Ensure you handle model fallbacks for the new stage.

## Adding UI Components

- Use **Lucide React** for icons.
- Use **clsx** and **tailwind-merge** for dynamic class names.
- Follow the glass-morphism pattern: `bg-surface-01/50 backdrop-blur-md border border-border-subtle`.

## Submission Process

1.  Run `npm run build` to verify TypeScript and Next.js compilation.
2.  Run `npm run test` to verify logic integrity.
3.  Ensure all new PII patterns are added to `lib/utils/redaction.ts`.
