Title: Security Headers at the Gateway

Intent
- Set strong, centralized HTTP security headers at the host gateway so all downstream apps inherit a baseline policy without modifying each child app.

Why This Is Useful
- Consistent protection across web/admin/reporting regardless of disparate stacks or release cadence.
- Easier audits and compliance: one place to review/update security posture.
- Mitigates common risks (clickjacking, MIME sniffing, mixed content) and enables HTTPS-only via HSTS.

What This Should Do (Conceptually)
- Add response headers for all routes proxied by the gateway:
  - Strict-Transport-Security (HSTS) with sensible preload/max-age.
  - Content-Security-Policy (CSP) with a pragmatic default-src/script-src/style-src/img-src/font-src/connect-src, and report-only mode for initial rollout.
  - X-Frame-Options or frame-ancestors (CSP) to prevent clickjacking.
  - Referrer-Policy, Permissions-Policy, X-Content-Type-Options, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy.
- Keep the policy origin-driven (allow child-app asset hosts) and compatible with Next.js streaming.

Scope and Integration Points
- Configure headers via `apps/host/next.config.ts` headers() so they apply to `/app/*`, `/admin/*`, `/reporting/*`, and root endpoints.
- Provide environment toggles for CSP report-only vs. enforce (e.g., `CSP_REPORT_ONLY=true`).
- Document any known exceptions (e.g., analytics, maps, auth callback flows) to be reflected in CSP.

Risks and Considerations
- CSP breakage if domains are missing; start in report-only, monitor, then enforce.
- Avoid duplicating/conflicting headers set by upstream CDN; define precedence strategy.
- Ensure headers do not block OAuth redirects/callbacks or embedded third-party widgets where required.

Rollout and Validation
- Phase 1: Enable report-only CSP and log/report violations (e.g., to a reporting endpoint or external tool).
- Phase 2: Address violations, tighten directives, then flip to enforcement in staging, then production.
- Acceptance: Security headers observed on representative routes; no functional regressions; violation rate near-zero post-enforcement.

