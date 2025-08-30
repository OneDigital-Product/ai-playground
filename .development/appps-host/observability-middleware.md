Title: Request Observability and Tracing Middleware

Intent
- Introduce lightweight edge middleware to enrich requests with correlation IDs, forward tracing headers, and minimal structured logs for gateway traffic.

Why This Is Useful
- Simplifies debugging across gateway → child apps by providing a consistent `X-Request-Id` and propagating trace context.
- Enables per-path latency/error rate insights at the domain entry point.
- Helps correlate CDN logs, gateway logs, and child app logs in incident response.

What This Should Do (Conceptually)
- In a `src/middleware.ts`, for all matched paths:
  - Generate or pass through a `X-Request-Id` if absent.
  - Preserve/propagate common tracing headers (e.g., W3C `traceparent`, `tracestate`).
  - Optionally attach a small set of diagnostic headers (e.g., `X-Gateway-Version`).
  - Emit structured logs for request start/finish at the gateway (status, path, duration, requestId).

Scope and Integration Points
- Route matching for `/app/:path*`, `/admin/:path*`, `/reporting/:path*`, and `/healthz`.
- Ensure logs go to the platform’s default log sink (no external dependency required).

Risks and Considerations
- Avoid logging PII; only high-level metadata.
- Keep middleware fast and non-blocking; do not fetch in the hot path.
- Confirm that propagation does not conflict with provider-level tracing.

Rollout and Validation
- Deploy to preview; confirm headers present downstream in `web` and `admin`.
- Verify request IDs align across logs for a sample request.
- Acceptance: Requests show correlation IDs end-to-end; no noticeable latency added at p95.

