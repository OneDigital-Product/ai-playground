# Repository Guidelines

## Agent & MCP Usage
- UI components: use shadcn/ui exclusively across apps. Generate and update components via the shadcn ui MCP server. Place shared primitives in `packages/ui`.
- Documentation lookups: use the Context7 MCP server whenever you need framework or library docs.

## Project Structure & Module Organization
- `apps/`: Next.js apps — `web` (user), `admin`, `docs`, and `@product/host` (gateway/proxy). Each uses the `app/` directory.
- `packages/`: Shared code and configs — `ui` (React components), `eslint-config`, `tailwind-config`, `typescript-config`.
- `scripts/`: Developer helpers (e.g., `scripts/dev-proxy.sh`).
- Monorepo is managed by Turborepo and pnpm workspaces.

## Shared UI Components (shadcn/ui + Tailwind v4)

Use the shared UI library in `packages/ui` and the shared Tailwind theme in `packages/tailwind-config` for a consistent design system across apps.

What’s included
- Components: Core shadcn/ui primitives (e.g., button, card, dialog, dropdown-menu, input, label, select, scroll-area, sheet, tabs, textarea, tooltip, radio-group, badge, alert-dialog, progress, table, collapsible, skeleton).
- Utilities: `cn` and helpers in `@repo/ui/lib/utils`.
- Theme: Central Tailwind v4 theme tokens, dark mode, and animation presets via `@repo/tailwind-config`.

How to consume in apps
- Styles: Ensure app-level CSS imports the shared theme (already wired in apps):
  - In each app globals: `@import "@repo/tailwind-config";`
- Components: Import from the UI package subpaths:
  - Example: `import { Button } from "@repo/ui/components/ui/button"`
  - Utilities: `import { cn } from "@repo/ui/lib/utils"`
- Next config: Keep `transpilePackages: ["@repo/ui"]` set in each app’s `next.config.ts`.

Adding or updating components
- Preferred source: Use the shadcn/ui MCP server to generate components.
- Placement: Shared, generic primitives go in `packages/ui/src/components/ui`. App-specific variants should live in the app until generalized.
- Dependencies: If a new component needs a runtime dep (e.g., a new `@radix-ui/*` package), add it to `packages/ui/package.json` and run `pnpm install`.
- Exports: If adding new folders/files, ensure `packages/ui/package.json` `exports` covers the path pattern (e.g., `"./components/*": "./src/components/*"`).

Tailwind v4 theme
- Theme source: `packages/tailwind-config/shared-styles.css` defines CSS variables, theme tokens, and layers. Apps include it via `@repo/tailwind-config`.
- Optional package CSS: `@repo/ui/styles.css` also re-exports the shared theme; prefer importing `@repo/tailwind-config` in apps.

TypeScript and builds
- UI package builds TS to `dist`; config at `packages/ui/tsconfig.json`.
- Build only UI: `pnpm -w run build --filter @repo/ui`.
- Check types: `pnpm -w run check-types --filter @repo/ui`.

Import examples
- Button: `@repo/ui/components/ui/button`
- Dialog: `@repo/ui/components/ui/dialog`
- Dropdown: `@repo/ui/components/ui/dropdown-menu`
- Select: `@repo/ui/components/ui/select`
- Utils: `@repo/ui/lib/utils`

Notes
- We intentionally excluded app-specific inputs (validated inputs, currency/percentage), charts, and infinite scroll from the shared library. If needed across apps, open a PR to add them back with minimal deps.

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
- Type safety: No `any` types. Do not use explicit `any` in apps or packages; prefer precise types, generics, `unknown`, and narrowing. The `@typescript-eslint/no-explicit-any` rule is enforced — do not disable it.

- Formatting: Prettier 3 with `prettier-plugin-tailwindcss`; run `pnpm format` before PRs.
- Linting: Shared configs in `@repo/eslint-config` with Next.js and React rules; no unused warnings in CI.
- React/Next: React 19 + Next 15. Use functional components and hooks.
- Files: `.ts/.tsx`; component files typically lowercase (e.g., `turborepo-logo.tsx`).
- Tailwind: v4 shared theme via `@repo/tailwind-config`; no class prefix.

## Testing Guidelines
- No formal test suite yet. For changes, run `pnpm lint` and `pnpm check-types` locally.
- If adding tests, prefer lightweight unit tests per package/app and Playwright for E2E. Keep tests near sources and name `*.test.ts(x)`.

## Commit & Pull Request Guidelines
- Commit style: Conventional Commits. Examples:
  - `feat(web): add profile page`
  - `fix(host): correct basePath redirect`
  - `chore(ui): bump tailwind`
- PRs: include a clear description, linked issues, and screenshots for UI. Keep PRs focused; ensure `pnpm lint && pnpm check-types` pass.

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

## Security & Configuration Tips
- Do not commit secrets. Use `apps/*/.env*`. `VERCEL_ENV=preview` triggers preview-only redirects in some apps.
- Use `transpilePackages` and shared Tailwind config as configured; avoid ad-hoc build steps in packages.
