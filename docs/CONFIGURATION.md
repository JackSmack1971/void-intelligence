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

## Local Configuration Files

Beyond environment variables, the system uses JSON files in the `config/` directory for engine-level settings:

### 1. `config/models.json`
Defines the available LLM models and their roles within the GoA system.
- `id`: The OpenRouter model string.
- `role`: One of `meta`, `logic`, `extraction`, `general`, or `fast`.
- `skills`: A list of hierarchical skills from the taxonomy that the model excels at.

### 2. `config/taxonomy.json`
Defines the hierarchical skill tree used for model selection and complexity analysis. 
- Format: `Category > Sub-category > Specific Skill`.

## Per-Environment Overrides

- **Development**: Use `.env.local` for local keys and settings.
- **Production**: Set environment variables in your deployment platform (e.g., Vercel, Docker).
- **Testing**: The system uses `.env.test` if present, otherwise defaults to standard environment variables with mock database paths.
