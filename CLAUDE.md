# CLAUDE.md

**Project Operating System for AI Agents in Google Antigravity IDE**

Every agent **must** load this file + `AGENTS.md` + its assigned GitHub Issue as the sole context.

## Project Overview

[Replace with 1–2 sentence description of this repository]

## Core Commands (Antigravity Terminal)

- Build: `npm run build` (or equivalent)
- Test: `npm test` / `pytest` / `go test`
- Lint: `npm run lint`
- Format: `npm run format`
- Full CI: `gh workflow run ci.yml`

## Folder Structure Philosophy

- `/src` — source code only
- `/.gnap/` — agent coordination (SSOT for swarm state)
- `/.github/ISSUE_TEMPLATE/` — all HIDD templates
- `/docs/` or inline `map.md` — module-level context

## HIDD & Antigravity Rules (Mandatory)

- GitHub Issues = Single Source of Truth. Never trust chat history.
- Every action logged as **FACT / DECISION / REVIEW** in the issue thread.
- Use isolated worktrees per sub-issue (CAID pattern).
- Read-only GitHub token by default. Writes gated via Approver agent.
- GNAP heartbeat required on every session.

## Security & AWI Guardrails

- No unquoted shell interpolation.
- Credential gateway only — never expose real secrets.
- Run Sentinel scan at session start.

Last updated: 2026-05-15
