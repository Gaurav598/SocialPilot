# SocialPilot OS API

## `GET /api/health`

Public health check for uptime and load tests.

## `GET /api/os/command-center`

Returns the authenticated user's command-center DTO.

Response:

```json
{
  "snapshot": {
    "workspace": {},
    "metrics": [],
    "agents": [],
    "pipeline": [],
    "timeline": []
  }
}
```

## `POST /api/ai/orchestrate`

Runs the multi-agent SocialPilot OS workflow.

Body:

```json
{
  "objective": "Launch a campaign from one founder insight",
  "platforms": ["LINKEDIN", "TWITTER"],
  "mode": "autopilot"
}
```

The route performs authentication, plan checks, rate limiting, memory retrieval, provider fallback, token tracking, cost tracking, performance prediction, and approval gating.

## `POST /api/os/search`

Runs semantic search across memory-backed vector documents.

Body:

```json
{
  "query": "best LinkedIn brand voice"
}
```
