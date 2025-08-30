Title: Access Controls for Admin Surface

Intent
- Add defense-in-depth controls at the gateway to protect `/admin/*` beyond app-level auth (e.g., IP allowlists, geo blocks, basic rate limits).

Why This Is Useful
- Reduces exposure of high-privilege surfaces to broad internet scanning and abuse.
- Provides a quick blast radius reduction independent of the admin app’s release cycle.

What This Should Do (Conceptually)
- Apply basic IP allowlist/denylist or geofencing via middleware for `/admin/*`.
- Add simple rate limiting keyed by IP or header for sensitive endpoints.
- Return clear error status codes and minimal response bodies on block.

Scope and Integration Points
- Keep controls configurable via env (e.g., `ADMIN_IP_ALLOWLIST`, toggle per environment).
- Ensure compatibility with upstream CDN/edge controls; do not duplicate heavy lifting where provider-native rules exist.

Risks and Considerations
- Be precise with CIDR parsing and proxy header trust (e.g., `X-Forwarded-For`).
- Align with legal/compliance for geo restrictions.

Rollout and Validation
- Start in report-only/logging mode to observe impact; then enforce.
- Acceptance: Legitimate admin users retain access; unwanted traffic is blocked with minimal false positives.

