# Getting Started with Void Intelligence

This guide will walk you through setting up and using Void Intelligence for the first time.

## 1. Installation

Ensure you have Node.js 18+ and npm installed.

```bash
npm install
```

## 2. API Setup

1.  Go to [OpenRouter](https://openrouter.ai/) and create an account.
2.  Generate an API Key.
3.  Add it to your `.env.local` file:
    ```env
    OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
    ```

## 3. Launching the App

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 4. Using the Intelligence Engine

### Starting a Chat
Type any query into the chat input. The engine will automatically determine if the query requires a multi-agent "Reasoning Loop" or a direct response.

### Understanding Reasoning Logs
As you chat, you will see status messages like:
- `Initializing Graph-of-Agents...`
- `Generating parallel perspectives...`
- `Scoring and refining logic...`
- `Synthesizing final intelligence...`

These represent the GoA pipeline stages working in real-time. Note that if the system detects **High Consensus** between initial expert responses, it may skip the refinement stage to deliver your answer faster.

## 5. Exploring the Knowledge Graph

Click the **Knowledge Graph** link in the sidebar. This dashboard visualizes the semantic triplets extracted from your conversations.
- **Nodes**: Entities (e.g., "Prime Numbers", "RSA").
- **Edges**: Relationships (e.g., "used_in").
- **Zoom/Pan**: Use your mouse to navigate the graph.

## 6. Privacy Redaction
You can verify redaction by typing PII (like a test email `test@example.com`) in the chat. The system will mask it locally before the API call and restore it when displaying the response.
