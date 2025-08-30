# Monorepo Overview

Product apps and shared packages managed with Turborepo and pnpm workspaces. All apps use Next.js (App Router) and TypeScript.

## Folder Structure

```
.
├─ apps/
│  ├─ web/            Next.js app for end users (App Router)
│  ├─ admin/          Next.js admin app (App Router)
│  ├─ docs/           Next.js docs site (App Router)
│  └─ host/           @product/host gateway/proxy (Next.js)
│
├─ packages/
│  ├─ ui/             Shared React UI (shadcn/ui style, Tailwind v4, ui- prefix)
│  ├─ eslint-config/  Shared ESLint config
│  ├─ tailwind-config/Shared Tailwind v4 config
│  └─ typescript-config/ Shared tsconfig presets
│
├─ scripts/           Dev helpers (e.g., dev-proxy.sh)
├─ turbo.json         Turborepo task pipeline
├─ pnpm-workspace.yaml Workspace package globs
└─ README.md          You are here
```

Notes
- UI components live in `packages/ui` and are consumed via `transpilePackages`. Tailwind v4 runs with a `ui-` class prefix to avoid collisions.
- Run all apps with `pnpm dev` or filter per app with `pnpm --filter <name> dev`.

## How `apps/host` Works (Gateway)

`apps/host` is a lightweight Next.js gateway that owns the primary domain and proxies to child apps. It keeps the top-level routes stable while apps can be deployed independently.

Routing behavior (see `apps/host/next.config.ts`):
- Redirects: in production, `/` → `/app`.
- Rewrites:
  - `/app/*` → `WEB_ORIGIN/app/*`
  - `/admin/*` → `ADMIN_ORIGIN/admin/*`
  - `/reporting/*` → `REPORTING_ORIGIN/*`
- Health check: `GET /healthz` returns `{ ok: true }`.

Environment variables (set in `apps/host/.env` or dashboard):

```
WEB_ORIGIN=https://web-<id>.vercel.app      # or http://localhost:3001
ADMIN_ORIGIN=https://admin-<id>.vercel.app   # or http://localhost:3002
REPORTING_ORIGIN=https://aks.example.com     # or http://localhost:4000
```

Local development
- Full proxy setup: `pnpm dev:proxy` starts `web:3001`, `admin:3002`, `host:3000`.
- Host only: `pnpm --filter @product/host dev` (expects env vars above).
- Test at `http://localhost:3000`: `/app`, `/admin`, `/reporting`, `/healthz`.

Deployment tips
- Root Directory: `apps/host`. Configure `WEB_ORIGIN`, `ADMIN_ORIGIN`, and `REPORTING_ORIGIN` in your hosting environment.
- No basePath. Rewrites are origin-driven, which supports preview deploys.

For additional details, see `apps/host/README.md`.
