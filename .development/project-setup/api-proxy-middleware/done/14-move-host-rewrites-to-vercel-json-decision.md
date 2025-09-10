# Task 14 — Decision Log: Move Host Rewrites to vercel.json

Status: Deferred (no code change to rewrites)

Summary
- We evaluated migrating `apps/host` external rewrites from `next.config.ts` to `apps/host/vercel.json`.
- Because the host relies on environment-specific origins (`WEB_ORIGIN`, `ADMIN_ORIGIN`, `REPORTING_ORIGIN`) that vary between Preview and Production, a static `vercel.json` cannot express the same dynamic behavior (no env interpolation in `destination`).
- To avoid regressions in Preview deployments, we are keeping rewrites in `next.config.ts` where environment variables are supported.

What we changed
- Updated `apps/host/vercel.json` to include the standard monorepo `ignoreCommand` and Convex build wrapper `buildCommand` for consistency with other apps. No rewrites were added here to avoid breaking Preview parity.

Why we didn’t move rewrites now
- `vercel.json` rewrites require static destinations; the host must target different external origins in Preview vs. Production.
- Current behavior in `next.config.ts` uses env vars so Preview deployments correctly point to the corresponding Preview origins of sibling apps and services.

Options to revisit later
- Introduce stable cross-env hostnames (e.g., `web.product.onedigital.com`, `admin.product.onedigital.com`, `reporting.product.onedigital.com`) and let Vercel Aliases/redirects handle environment resolution behind those names. Once stable, move rewrites to `vercel.json` safely.
- Add a prebuild step to generate `vercel.json` with env substitution (adds complexity; not recommended unless strongly needed).

Acceptance criteria mapping
- “Routing behaves identically in preview”: Maintained by leaving rewrites in `next.config.ts`.
- “Unaffected apps show ⏭ Unaffected in build logs”: Preserved. The added `ignoreCommand` remains in place.

