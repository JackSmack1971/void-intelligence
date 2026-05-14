# Configuration Guide

Void Intelligence is configured via environment variables and local database files.

## Environment Variables

Create a `.env.local` file in the root directory:

| Variable | Description | Required | Default |
| :--- | :--- | :--- | :--- |
| `OPENROUTER_API_KEY` | Your OpenRouter API key. | **Yes** | N/A |
| `DATABASE_URL` | SQLite connection string. | No | `file:void-intelligence.db` |

## Model Selection

The engine uses specific models for different stages of the GoA pipeline. These are defined in `lib/goa/engine.ts`:

- **Sampling/Scoring**: `liquid/lfm-40b:free`
- **Parallel Generation**: `google/gemini-2.0-flash-exp:free`
- **Refinement/Synthesis**: `deepseek/deepseek-r1:free`
- **KG Extraction**: `jondurbin/bagel-dpo-34b:free` (Owl Alpha fallback)

## Database Schema

The SQLite database (`void-intelligence.db`) contains two primary tables:

### 1. `triplets`
Stores the semantic entities extracted from conversations.
- `id`: Primary Key
- `subject`: Entity A
- `predicate`: Relationship
- `object`: Entity B
- `timestamp`: Record creation time

### 2. `messages`
Stores chat history for context preservation.
- `id`: Primary Key
- `thread_id`: Unique conversation ID
- `role`: `user` or `assistant`
- `content`: Text content
- `timestamp`: Record creation time

## Rate Limiting

The OpenRouter free tier is limited to **20 requests per minute**. The system implements:
- **Sequential Delay**: Non-parallel tasks are throttled.
- **Retry Logic**: 429 errors trigger a 1s -> 2s -> 4s exponential backoff.
