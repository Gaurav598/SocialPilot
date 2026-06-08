# SocialPilot OS V2 Architecture

SocialPilot V2 moves the product from an AI scheduler into an AI social media operating system.

```mermaid
flowchart LR
  UI["Command Center UI"] --> API["Next.js Route Handlers"]
  API --> DAL["Server-only Data Access Layer"]
  API --> Agents["Multi-agent Orchestrator"]
  Agents --> Router["Model Router"]
  Router --> Insforge["Insforge / Gemini"]
  Router --> OpenAI["OpenAI"]
  Router --> Anthropic["Anthropic"]
  Agents --> RAG["Vector Search / RAG"]
  Agents --> Memory["Memory System"]
  Agents --> Analytics["Performance Predictor"]
  DAL --> DB["Insforge Postgres"]
  API --> Audit["Audit Logs / Outbox"]
```

## Key Improvements

- App Router pages stay server-first. Interactive UX lives in client islands.
- AI providers are abstracted behind `createModelRouter`.
- Agent orchestration is split into research, content, optimization, repurposing, scheduling, and analytics agents.
- RAG uses deterministic 64-dimensional embeddings locally and maps cleanly to `pgvector`.
- Memory is modeled as short-term, long-term, episodic, and semantic records.
- The database migration adds organizations, workspaces, roles, memories, embeddings, analytics, listening, approvals, comments, audit logs, webhooks, and outbox events.
- The command center demonstrates autonomous mode while preserving human approval before publishing.

## Request Flow

```mermaid
sequenceDiagram
  participant User
  participant UI as Command Center
  participant API as /api/ai/orchestrate
  participant Agent as Agent Pipeline
  participant RAG as Memory + Vector Search
  participant LLM as Model Router
  User->>UI: Enters campaign objective
  UI->>API: POST objective and platforms
  API->>API: Auth, plan check, rate limit
  API->>Agent: Run six-agent workflow
  Agent->>RAG: Retrieve style and performance context
  Agent->>LLM: Route each task to best provider
  LLM-->>Agent: Structured agent outputs
  Agent-->>API: Schedule, prediction, cost, tokens
  API-->>UI: Approval-required campaign plan
```
