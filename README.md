# Void Intelligence

Your private intelligence graph in absolute darkness.

Void Intelligence is a production-grade reasoning engine built on a **Graph-of-Agents (GoA)** architecture. It leverages elite LLMs from the OpenRouter ecosystem to perform multi-stage parallel reasoning, extracting semantic triplets into a persistent Knowledge Graph for personalized intelligence.

---

## 🎨 Elite Cyber-Brutalist Visual Tier

The interface features an elite, premium cyber-brutalist visual system built with **Tailwind CSS v4** and styled for absolute telemetry awareness:

- **[SkillNode](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/SkillNode.tsx)**: Dynamic network nodes visualizing active agent statuses (Root, Category, Agent configurations) complete with glowing neon borders and pulsing heartbeat indicators.
- **[ErrorBoundary](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/ErrorBoundary.tsx)**: Premium crimson diagnostic fallbacks featuring expandable error stack traces and double click-to-retry inline controllers.
- **[DebateGraph](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/DebateGraph.tsx)**: React Flow debate flow charts with color-coded nodes (emerald refinements, warnings gold critiques, and purple user interventions) loaded with frosted context interception drawers.
- **[ChatMessage](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/ChatMessage.tsx)**: Standalone telemetry capsules featuring glowing chat bubbles, expander strategy accordions, and metric badge capsules (Stability, Harmony, Turns).
- **[FeatureCard](file:///c:/Users/click/Desktop/New%20project/void-intelligence/components/FeatureCard.tsx)**: Sleek, interactive frosted console display cards loaded with keyboard accessibility parameters (`tabIndex={0}`, `role="button"`) and group-hover scaling transitions.
- **[Tailwind v4 globals.css](file:///c:/Users/click/Desktop/New%20project/void-intelligence/app/globals.css)**: Zero-overhead configuration featuring custom inline design variables and utility class layers (like `.glass-premium` and custom keyframe heartbeat/pulse glows).

---

## 🌌 Core Features

- **Graph-of-Agents (GoA)**: A 5-stage orchestration pipeline (Sampling, Parallel Generation, Matrix-Scoring, Refinement, and Synthesis).
- **Persistent Knowledge Graph**: Real-time triplet extraction using `Owl Alpha` stored in local SQLite via `libsql`.
- **Privacy First**: Client-side PII redaction ensures sensitive data never leaves your environment.
- **SSE Streaming**: Real-time response generation with live reasoning logs.
- **Cyber-Brutalist UI**: A high-performance interface built with Next.js 15, Tailwind v4, and React Flow.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Styling**: Tailwind CSS v4 (Glassmorphism & Cyber-Brutalist design)
- **Orchestration**: Custom GoA Engine (TypeScript)
- **Database**: SQLite (libsql) for chat history and KG triplets
- **API**: OpenRouter (Exclusive free-tier model ecosystem)
- **Testing**: Vitest (130+ unit tests passing with JSDOM support) + Playwright

---

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

---

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:
- [Architecture](./docs/ARCHITECTURE.md): Technical deep-dive into the GoA engine.
- [Configuration](./docs/CONFIGURATION.md): Environment variables and setup.
- [Getting Started](./docs/GETTING-STARTED.md): User guides and walkthroughs.
- [Development](./docs/DEVELOPMENT.md): Contribution guidelines and codebase map.
- [Testing](./docs/TESTING.md): Test suite overview and verification.
- [API Reference](./docs/API.md): Engine interfaces and Server Actions.
- [Visual Components](./docs/COMPONENTS.md): Cyber-brutalist interactive custom components guide.

---

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

---

## 🤝 Contributing

Contributions are welcome! Please see the documentation in `docs/DEVELOPMENT.md` for local setup and coding standards.

---

## ⚖️ License

Private / Local Use Only.
