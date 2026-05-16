# Void Intelligence

Your private intelligence graph in absolute darkness.

Void Intelligence is a production-grade reasoning engine built on a **Graph-of-Agents (GoA)** architecture. It leverages elite LLMs from the OpenRouter ecosystem to perform multi-stage parallel reasoning, extracting semantic triplets into a persistent Knowledge Graph for personalized intelligence.

## 🌌 Core Features

- **Graph-of-Agents (GoA)**: A 5-stage orchestration pipeline (Sampling, Parallel Generation, Matrix-Scoring, Refinement, and Synthesis).
- **Persistent Knowledge Graph**: Real-time triplet extraction using `Owl Alpha` stored in local SQLite via `libsql`.
- **Privacy First**: Client-side PII redaction ensures sensitive data never leaves your environment.
- **SSE Streaming**: Real-time response generation with live reasoning logs.
- **Cyber-Brutalist UI**: A high-performance interface built with Next.js 15, Tailwind v4, and React Flow.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Styling**: Tailwind CSS v4 (Glassmorphism & Cyber-Brutalist design)
- **Orchestration**: Custom GoA Engine (TypeScript)
- **Database**: SQLite (libsql) for chat history and KG triplets
- **API**: OpenRouter (Exclusive free-tier model ecosystem)
- **Testing**: Vitest + Playwright

## 🚀 Quick Start

1. **Clone the repo**:
   ```bash
   git clone <repo-url>
   cd void-intelligence
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   Create a `.env.local` file:
   ```env
   OPENROUTER_API_KEY=your_api_key_here
   ```

4. **Run the engine**:
   ```bash
   npm run dev
   ```

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:
- [Architecture](./docs/ARCHITECTURE.md): Technical deep-dive into the GoA engine.
- [Configuration](./docs/CONFIGURATION.md): Environment variables and setup.
- [Getting Started](./docs/GETTING-STARTED.md): User guides and walkthroughs.
- [Development](./docs/DEVELOPMENT.md): Contribution guidelines and codebase map.
- [Testing](./docs/TESTING.md): Test suite overview and verification.
- [API Reference](./docs/API.md): Engine interfaces and Server Actions.

## 💡 Usage Examples

### Running a Reasoning Cycle
You can trigger a GoA reasoning cycle directly from the UI or by invoking the orchestrator in your code:

```typescript
import { GoAOrchestrator } from './lib/goa/engine';
import { ModelCard } from './lib/goa/types';

const orchestrator = new GoAOrchestrator();
const result = await orchestrator.run("How do I implement AES-GCM in Node.js?", modelCards);

console.log(result.finalResponse);
console.log(`Harmony Score: ${result.harmonyScore}`);
```

### Knowledge Graph Exploration
The engine automatically extracts entities and relationships. You can view the generated graph in the **Strategic Command Dashboard**.

## 🤝 Contributing

Contributions are welcome! Please see the documentation in `docs/DEVELOPMENT.md` for local setup and coding standards.

## ⚖️ License

Private / Local Use Only.
