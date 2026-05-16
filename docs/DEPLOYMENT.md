<!-- generated-by: gsd-doc-writer -->
# Deployment Guide

Void Intelligence is designed to be portable and private, supporting both local execution and cloud deployment.

## Deployment Targets

### 1. Vercel (Recommended)
As a Next.js application, Void Intelligence is optimized for Vercel.
- **Config**: Automatically detected from `next.config.ts`.
- **Database**: Use a hosted SQLite provider (like Turso/libsql) or mount a persistent volume if using a custom VPS.

### 2. Docker / Containerized
The system uses Docker for infrastructure components like ChromaDB.
- **File**: `docker-compose.yml`
- **Infrastructure**: Launches ChromaDB on port 8000 for vector intelligence.

## Build Pipeline

Currently, there is no automated CI/CD pipeline configured. Deployments are handled manually:

1. **Build**: `npm run build`
2. **Push**: Push to the `main` branch (triggers Vercel auto-deploy if connected).
3. **Environment**: Ensure all variables in `.env.local` are mirrored in the deployment platform's secret manager.

## Environment Setup

The following environment variables are required for production:

| Variable | Description | Source |
| :--- | :--- | :--- |
| `OPENROUTER_API_KEY` | Primary reasoning engine key. | [OpenRouter](https://openrouter.ai/) |
| `DATABASE_URL` | Persistent SQLite path. | Internal |
| `CHROMA_URL` | Vector DB endpoint. | `http://localhost:8000` |

<!-- VERIFY: Production DATABASE_URL for Turso/libsql if applicable -->
<!-- VERIFY: External CHROMA_URL if not running via docker-compose locally -->

## Rollback Procedure

Since deployments are primarily branch-based:
1. **Vercel**: Use the Vercel dashboard to select a previous successful deployment and click "Redeploy".
2. **Git**: Revert the `main` branch to a known stable commit and push.

## Monitoring

- **Telemetry**: Core engine metrics (consensus, stability, latency) are logged via `lib/utils/telemetry.ts`.
- **Client Errors**: React Error Boundaries capture and log rendering failures.
- **Next.js Logs**: Check Vercel or your hosting provider's logs for runtime exceptions.

<!-- VERIFY: Sentry or Datadog dashboard URL if integrated in production -->
