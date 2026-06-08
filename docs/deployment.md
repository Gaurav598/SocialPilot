# Deployment

## Local Production Build

```bash
npm ci
npm run build
npm run start
```

## Docker

```bash
docker compose up --build
```

The image uses Next.js standalone output and exposes port `3000`.

## Required Environment

- `NEXT_PUBLIC_INSFORGE_BASE_URL`
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`
- `INSFORGE_PROJECT_API_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

Optional AI providers:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `AI_PRIMARY_PROVIDER`

## Scale Plan

- Use horizontal app replicas behind a load balancer.
- Move rate limits, queues, and locks to Redis.
- Use Inngest for durable background workflows.
- Store vectors in Postgres `pgvector` or a managed vector database.
- Export traces through OpenTelemetry to the chosen observability backend.
