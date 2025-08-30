Title: Maintenance Mode and Failover Routing

Intent
- Provide a controlled maintenance page and failover strategy when a child app is unavailable or during planned work.

Why This Is Useful
- Reduces incident impact with clear user messaging and alternative routing where possible.
- Allows planned maintenance windows without DNS changes or code redeploys in child apps.

What This Should Do (Conceptually)
- Config toggles (env or feature flag) to:
  - Serve a lightweight maintenance page for selected paths (e.g., `/admin/*`).
  - Route select paths to an alternate origin (temporary failover) when the primary is degraded.
- Include a simple banner/headers to disable caching and indicate maintenance state.

Scope and Integration Points
- Implement logic in `next.config.ts` rewrites/redirects combined with middleware checks.
- Keep maintenance page as a static route under `src/app/maintenance` for reliability.

Risks and Considerations
- Ensure search engines do not index maintenance content (serve `503` + `Retry-After` for planned outages as appropriate).
- Communicate authenticated session expectations if failover does not share auth state.

Rollout and Validation
- Dry-run with feature flag in preview; verify toggling on/off without redeploys if possible.
- Acceptance: Operators can enable maintenance for a path; users see friendly page; normal routing restored cleanly.

