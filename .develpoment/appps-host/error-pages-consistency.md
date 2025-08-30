Title: Consistent 404/500 Experiences at the Gateway

Intent
- Provide user-friendly, consistent error pages (404/500) at the host level to handle cases where upstreams fail or paths are invalid.

Why This Is Useful
- Better UX than default provider errors; maintains brand and guidance.
- Shields transient upstream failures with a consistent fallback message.

What This Should Do (Conceptually)
- Add custom not-found and error pages in the host to cover:
  - No matching route (e.g., outside `/app`/`/admin`/`/reporting`).
  - Upstream failure in rewrite (timeout, 5xx) surfaced as user-facing friendly page.
- Provide links to primary sections and a retry hint.

Scope and Integration Points
- Implement pages under `src/app` using Next.js error boundary conventions.
- Where feasible, detect upstream failure and map to a user-friendly message while preserving accurate HTTP status.

Risks and Considerations
- Don’t mask persistent upstream errors; maintain observability signals and correct status codes.
- Avoid caching error content for dynamic paths.

Rollout and Validation
- Test with synthetic upstream failures (simulate timeouts/5xx) and missing routes.
- Acceptance: Users see friendly pages; logs/alerts still capture the underlying errors.

