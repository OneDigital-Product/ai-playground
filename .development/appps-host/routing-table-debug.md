Title: Routing Table Debug Page

Intent
- Expose a gated debug page that reveals the current routing table, active origins, and basic health indicators to aid developers and operators.

Why This Is Useful
- Speeds up troubleshooting by confirming which origin a given path maps to in the current environment.
- Validates env configuration and preview/canary routing rules.

What This Should Do (Conceptually)
- Serve a page (e.g., `/__routing`) that lists:
  - Current values of `WEB_ORIGIN`, `ADMIN_ORIGIN`, `REPORTING_ORIGIN` (masked as needed).
  - Active rewrite patterns and any maintenance/canary flags.
  - Optional shallow health pings with status.

Scope and Integration Points
- Gate access by environment or staff-only header/cookie to avoid exposing internals publicly.
- Keep the page static and safe (no secrets, no write operations).

Risks and Considerations
- Do not leak secrets or tokens; mask sensitive parts of origins.
- Prevent search engine indexing (robots and meta noindex, or path excluded entirely in prod).

Rollout and Validation
- Verify only authorized users can access in production.
- Acceptance: Operators can quickly confirm routing state without redeploys.

