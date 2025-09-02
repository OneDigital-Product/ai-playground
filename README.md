# Monorepo Overview

Product apps and shared packages managed with Turborepo and pnpm workspaces. The user-facing app is Astro 5 + React 19; admin/docs/host are Next.js 15 (App Router). All code is TypeScript (strict).

See AGENTS.md for the full repository guidelines and apps/web/AGENTS.md for the web app specifics.

## Folder Structure

```
.
├─ apps/
│  ├─ web/            Astro 5 + React 19 (served under /app)
│  ├─ admin/          Next.js 15 admin app (App Router)
│  ├─ docs/           Next.js 15 docs site (App Router)
│  ├─ retirement/     Next.js 15 app mounted at /retirement (App Router)
│  ├─ enrollment-dashboard/ Next.js 15 app mounted at /enrollment-dashboard (App Router)
│  └─ host/           @product/host gateway/proxy (Next.js 15)
│
├─ packages/
│  ├─ ui/             Shared React UI (shadcn/ui primitives, Tailwind v4)
│  ├─ backend/        Shared Convex backend functions and types
│  ├─ eslint-config/  Shared ESLint config
│  ├─ tailwind-config/Shared Tailwind v4 theme & PostCSS config
│  └─ typescript-config/ Shared tsconfig presets
│
├─ scripts/           Dev helpers (e.g., dev-proxy.sh, turbo-ignore.js)
├─ turbo.json         Turborepo task pipeline
├─ pnpm-workspace.yaml Workspace package globs
└─ README.md          You are here
```

Notes
- Shared UI lives in `packages/ui` and is imported from subpaths like `@repo/ui/components/ui/button`. Utilities at `@repo/ui/lib/*`.
- Tailwind v4 theme is centralized in `packages/tailwind-config` and imported in each app’s global CSS via `@import "@repo/tailwind-config";`. No class prefix.
- Next apps should include `transpilePackages: ["@repo/ui", "@repo/backend"]` in `next.config.ts`. Astro imports directly without transpilePackages.
- Run all apps with `pnpm dev` or filter per app with `pnpm --filter <name> dev`.

## Shared UI & Theme

- Components: Core shadcn/ui primitives (button, card, dialog, dropdown-menu, input, label, select, scroll-area, sheet, tabs, textarea, tooltip, radio-group, badge, alert-dialog, progress, table, collapsible, skeleton).
- Styles: Apps import the shared Tailwind v4 theme via `@repo/tailwind-config`; `@repo/ui/styles.css` also re-exports the theme for convenience.
- Adding components: Prefer generating via the shadcn/ui MCP server. Place shared, generic primitives under `packages/ui/src/components/ui`. Ensure `packages/ui/package.json` exports cover new paths.

## Development & Builds

- Install: `pnpm install` (Node >= 18)
- Dev (all): `pnpm dev`
- Dev (single app): `pnpm --filter web|admin|docs|retirement|enrollment-dashboard|@product/host dev`
  - Example: `pnpm --filter enrollment-dashboard dev --port 3004`
 - Local proxy: `pnpm dev:proxy` (host:3000 proxies web:3001 and admin:3002)
   - Access via host: `http://localhost:3000/app` and `http://localhost:3000/admin`
   - Other apps (run standalone): retirement:3003 → `http://localhost:3003/retirement`, enrollment-dashboard:3004 → `http://localhost:3004/enrollment-dashboard`
- Build (all): `pnpm build`
- Lint: `pnpm lint` (max warnings 0)
- Type-check: `pnpm check-types`
- Format: `pnpm format` (Prettier 3 + Tailwind plugin)
- UI package only: `pnpm -w run build --filter @repo/ui` and `pnpm -w run check-types --filter @repo/ui`

## Web App (Astro) — Base Path

The web app is served from `/app` (see `apps/web/astro.config.mjs`). For absolute links and assets in the web app, prefix with `/app/...` or use relative paths.

## Additional Next.js Apps — Base Paths

- Retirement: served from `/retirement` (see `apps/retirement/next.config.ts`).
- Enrollment Dashboard: served from `/enrollment-dashboard` with a root redirect using `basePath: false` so Vercel previews work from the domain root (see `apps/enrollment-dashboard/next.config.ts`).

## Host Gateway (`apps/host`)

`apps/host` is a lightweight Next.js gateway that owns the primary domain and proxies to child apps.

Routing behavior (see `apps/host/next.config.ts`):
- Redirects (production only): `/` → `/app`
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

## Vercel + Turborepo

- Each app should include a minimal `vercel.json` with an `ignoreCommand` that runs `node ../../scripts/turbo-ignore.js` to skip unaffected builds.
- Web app specifics (`apps/web/vercel.json`): includes `rewrites` for `/app` and a `buildCommand` that deploys Convex and injects `NEXT_PUBLIC_CONVEX_URL` before running the Astro build.
- Turborepo caching: ensure `turbo.json` outputs are set per app (Next: `.next/**` excluding cache; Astro: `dist/**`; libs: `dist/**`).

## Agents & Docs

- Components: Use the shadcn/ui MCP server to generate/update shared primitives.
- Documentation: Use the Context7 MCP server for framework/library lookups.
- Read more: `AGENTS.md` (repo-wide) and `apps/web/AGENTS.md` (web-specific).

## Conventions

- TypeScript (strict). Never use `any`; prefer precise types or `unknown` with narrowing.
- Prettier 3 (with Tailwind plugin) and `@repo/eslint-config` for linting. Keep warnings at 0.
- Conventional Commits for PRs, e.g., `feat(web): add profile page`.

## Security

- Do not commit secrets. Use `apps/*/.env*`. Some apps use `VERCEL_ENV=preview` for preview-only behavior.

For additional details, see `apps/host/README.md` and `apps/web/README.md`.
