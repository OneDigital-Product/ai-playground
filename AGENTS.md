# Repository Guidelines

## Agent & MCP Usage
- UI components: use shadcn/ui exclusively across apps. Generate and update components via the shadcn ui MCP server. Place shared primitives in `packages/ui`.
- Documentation lookups: use the Context7 MCP server whenever you need framework or library docs.

## Project Structure & Module Organization
- `apps/`: Next.js apps — `web` (user), `admin`, `docs`, and `@product/host` (gateway/proxy). Each uses the `app/` directory.
- `packages/`: Shared code and configs — `ui` (React components), `eslint-config`, `tailwind-config`, `typescript-config`.
- `scripts/`: Developer helpers (e.g., `scripts/dev-proxy.sh`).
- Monorepo is managed by Turborepo and pnpm workspaces.

## Build, Test, and Development Commands
- Install: `pnpm install` (Node >= 18, pnpm per `packageManager`).
- Develop all: `pnpm dev` (runs `turbo run dev`).
- Single app: `pnpm --filter web dev` (swap `web|admin|@product/host|docs`).
- Local proxy: `pnpm dev:proxy` — starts `web:3001`, `admin:3002`, `host:3000`. Create `apps/host/.env` (see `apps/host/.env.local.example`).
- Build: `pnpm build` (Next builds and `packages/ui` artifacts).
- Start (per app): `pnpm --filter @product/host start`.
- Lint: `pnpm lint` (ESLint, max warnings 0 in apps).
- Type-check: `pnpm check-types` (tsc --noEmit across packages/apps).
- Format: `pnpm format` (Prettier 3 + Tailwind plugin).

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Indentation: 2 spaces.
- Formatting: Prettier 3 with `prettier-plugin-tailwindcss`; run `pnpm format` before PRs.
- Linting: Shared configs in `@repo/eslint-config` with Next.js and React rules; no unused warnings in CI.
- React/Next: React 19 + Next 15. Use functional components and hooks.
- Files: `.ts/.tsx`; component files typically lowercase (e.g., `turborepo-logo.tsx`).
- Tailwind: v4. `packages/ui` uses a `ui-` class prefix to avoid collisions.

## Testing Guidelines
- No formal test suite yet. For changes, run `pnpm lint` and `pnpm check-types` locally.
- If adding tests, prefer lightweight unit tests per package/app and Playwright for E2E. Keep tests near sources and name `*.test.ts(x)`.

## Commit & Pull Request Guidelines
- Commit style: Conventional Commits. Examples:
  - `feat(web): add profile page`
  - `fix(host): correct basePath redirect`
  - `chore(ui): bump tailwind`
- PRs: include a clear description, linked issues, and screenshots for UI. Keep PRs focused; ensure `pnpm lint && pnpm check-types` pass.

## Security & Configuration Tips
- Do not commit secrets. Use `apps/*/.env*`. `VERCEL_ENV=preview` triggers preview-only redirects in some apps.
- Use `transpilePackages` and shared Tailwind config as configured; avoid ad-hoc build steps in packages.


## Vercel + Turborepo Performance Guide (Monorepo)

Use this concise checklist when adding new apps to keep builds fast and caching effective.

- Vercel project setup
  - Root Directory: apps/web | apps/docs | apps/admin | apps/host
  - Build Command: default (Turbo auto-detected)
  - Install Command: pnpm install

- Required per-app vercel.json (skip unaffected builds)
  - In each app directory, add:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "ignoreCommand": "node ../../scripts/turbo-ignore.js"
}
```

- Turborepo best practices
  - package.json name matches workspace; internal deps use workspace:*
  - turbo.json outputs: Next [".next/**", "!.next/cache/**"]; libs ["dist/**"]
  - Optional: globalDependencies ["pnpm-lock.yaml", "pnpm-workspace.yaml"], globalEnv ["NODE_ENV", "VERCEL_ENV"]

- Verify behavior
  - Unaffected apps: Ignored Build Step shows "⏭ Unaffected"
  - Affected apps: build runs; logs include "Remote caching enabled"
  - No "npm warn exec ... turbo-ignore" lines (zero-download)

- Troubleshoot quickly
  - If unexpected builds: check per-app vercel.json and workspace deps/names
  - Script logs "checking paths -> ..."; run `node ../../scripts/turbo-ignore.js` locally (0=skip, 1=build)
  - Monitor build time, cache hits, and "Creating build cache" duration
