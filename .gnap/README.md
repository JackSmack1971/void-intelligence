# .gnap/README.md

**Git-Native Agent Protocol (GNAP) — Heartbeat Loop**

This directory is the coordination substrate for multi-agent swarms. Git log = audit trail.

## Directory Structure

- `agents.json`     — active agents & roles
- `tasks/*.json`    — assigned work units
- `messages/*.json` — inter-agent communication
- `runs/*.json`     — execution logs + token cost

## Mandatory Heartbeat (run in every Antigravity session)

1. `git pull --rebase`
2. Verify role in `agents.json`
3. Read assigned task from `tasks/`
4. Communicate via `messages/`
5. Execute → commit → write run artifact
6. `git push`
7. Post FACT/DECISION/REVIEW to GitHub Issue

See AGENTS.md section 4 for full protocol.
