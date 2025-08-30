Title: Preview/Canary Routing via Cookies or Headers

Intent
- Enable selective routing of traffic to preview or canary origins without changing the default production routes.

Why This Is Useful
- Safe, granular validation of new versions with internal users or a small traffic slice.
- Reproduces user issues by pinning a session to a specific backend without DNS changes.

What This Should Do (Conceptually)
- Inspect a cookie or header (e.g., `x-canary=web-preview-123`) in middleware.
- When present and valid, rewrite requests to the designated preview/canary origin for `/app/*` or `/admin/*`.
- Default to stable origins when the signal is absent or invalid.

Scope and Integration Points
- Maintain an allowlist of preview origins derived from CI outputs or env.
- Add lightweight guardrails (TTL on cookie, path scoping per app).

Risks and Considerations
- Avoid exposing preview environments broadly; restrict to authenticated staff/IP ranges.
- Ensure analytics and error reporting distinguish canary vs. stable traffic.
- Prevent cache pollution by varying on the routing cookie/header as needed.

Rollout and Validation
- Exercise in preview with synthetic traffic; confirm session stickiness and easy rollback.
- Acceptance: Targeted users hit preview backend consistently; no leakage to general users.

