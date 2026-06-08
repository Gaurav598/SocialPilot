# Developer Onboarding

## Product Areas

- `app/(routes)/(dashboard)/command-center`: V2 command-center route.
- `components/os`: command palette and AI operating-system UI.
- `lib/social-os/ai`: provider routing and agent orchestration.
- `lib/social-os/rag`: embeddings and semantic search.
- `lib/social-os/memory`: persistent memory model.
- `lib/social-os/analytics`: performance prediction.
- `lib/db/socialpilot-os-v2.sql`: enterprise schema expansion.

## Working Rules

- Read `AGENTS.md` and relevant `node_modules/next/dist/docs` files before Next.js changes.
- Keep secrets inside server-only modules.
- Return DTOs to client components rather than raw database rows.
- Keep legacy scheduler APIs backward compatible.
- Require human approval before any autonomous publishing workflow.
