Title: Move Path Routing to Provider Edge

Intent
- Shift path routing from Next.js app-level rewrites to provider-level rules (e.g., Vercel/Cloudflare/NGINX) to cut latency and reduce app responsibilities.

Why This Is Useful
- Lower request overhead: fewer server hops and less Node work.
- Simplifies the host app to a thin health/landing layer while keeping centralized control in infrastructure.

What This Should Do (Conceptually)
- Replicate `/app/*`, `/admin/*`, `/reporting/*` rewrites as edge rules at the hosting provider.
- Keep environment-specific origins in provider config or secrets rather than app env.
- Retain the host app only for `/`, `/healthz`, and other small utilities if desired.

Scope and Integration Points
- Document the exact current rewrite patterns and translate them into provider config.
- Decide on ownership: infra team updates for prod/preview; app team retains local rewrites for dev only.

Risks and Considerations
- Configuration drift between provider and repo; codify rules (e.g., IaC) when possible.
- Ensure headers/tracing/security policies remain consistent (some may still live in the app or be moved to edge).

Rollout and Validation
- Deploy edge rules to a preview domain; compare performance and behavior.
- Acceptance: Same routing behavior with improved latency; zero functional regressions.

