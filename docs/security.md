# Security Notes

## Implemented

- Clerk authentication remains enforced through `proxy.ts`.
- `/api/health` is explicitly public for infrastructure monitoring.
- AI and search APIs apply per-user in-memory rate limits.
- AI provider keys stay server-side in `lib/social-os/ai/providers.ts`.
- Security headers are configured in `next.config.ts`.
- CSP is report-only to avoid breaking Clerk while still surfacing policy violations.
- Database migration enables RLS on V2 tables.
- Audit log and event outbox tables are included for enterprise traceability.

## Production Checklist

- Move rate limiting to Redis for multi-instance enforcement.
- Rotate AI provider keys and Insforge credentials on a scheduled cadence.
- Replace report-only CSP with enforced CSP after collecting violations.
- Hash IP addresses before writing audit logs.
- Add SQL injection tests for any future raw SQL.
- Add webhook signing and replay protection before enabling outbound webhooks.
- Run dependency scanning in CI.
- Run penetration testing before exposing autonomous workflows to customers.
