Title: Composite /healthz for Downstream Readiness

Intent
- Upgrade the host’s `/healthz` to optionally probe child apps and return a composite health status with clear, fast-fail semantics.

Why This Is Useful
- Single check for uptime monitors and smoke tests that reflects the actual user-facing surface.
- Early detection of partial outages (e.g., admin down while web is up).
- Can inform failover/maintenance routing decisions at the gateway.

What This Should Do (Conceptually)
- `/healthz` accepts a mode flag (e.g., `?deep=true`) to perform downstream checks against `WEB_ORIGIN`, `ADMIN_ORIGIN`, and `REPORTING_ORIGIN` lightweight endpoints.
- Returns JSON with per-service status, latency, and an overall `ok`.
- Sets appropriate status codes (e.g., `200` when all OK, `503` if any critical dependency fails in deep mode).

Scope and Integration Points
- Implement in `src/app/healthz/route.ts` without introducing heavy dependencies.
- Timeouts per probe to avoid cascading slowness; configurable thresholds via env.

Risks and Considerations
- Avoid turning `/healthz` into a source of load; keep probes head or minimal GET.
- Ensure health endpoints on child apps are cheap and stable.
- Rate-limit deep checks if exposed publicly, or restrict via header/token.

Rollout and Validation
- Start with shallow mode default; enable deep checks in staging.
- Integrate with the uptime monitor to call deep mode at a lower frequency.
- Acceptance: Health reflects real downstream state; no alert noise from transient timeouts.

