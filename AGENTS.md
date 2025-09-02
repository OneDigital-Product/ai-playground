# Repository Guidelines

## Agent & MCP Usage
- UI components: use shadcn/ui exclusively across apps. Generate and update components via the shadcn ui MCP server. Place shared primitives in `packages/ui`.
- Documentation lookups: use the Context7 MCP server whenever you need framework or library docs.

## Project Structure & Module Organization
- `apps/`: Frontend apps —
  - `web` (user): Astro 5 + React 19, served under base path `/app`.
  - `admin`, `docs`, `@product/host` (gateway/proxy): Next.js 15 (App Router).
- `packages/`: Shared code and configs — `ui` (React components), `eslint-config`, `tailwind-config`, `typescript-config`.
- `scripts/`: Developer helpers (e.g., `scripts/dev-proxy.sh`).
- Monorepo is managed by Turborepo and pnpm workspaces.

For deeper `apps/web` guidance, see `apps/web/AGENTS.md`.

## Shared UI Components (shadcn/ui + Tailwind v4)

**⚠️ IMPORTANT: Before making any UI changes, read `TAILWIND_V4_MONOREPO_GUIDE.md` for critical spacing and import patterns to avoid common issues.**

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
- Next apps: Keep `transpilePackages: ["@repo/ui", "@repo/backend"]` set in each app’s `next.config.ts`.
- Astro app (`apps/web`): no `transpilePackages`; import components directly and include the shared CSS theme.

Adding or updating components
- Preferred source: Use the shadcn/ui MCP server to generate components.
- Placement: Shared, generic primitives go in `packages/ui/src/components/ui`. App-specific variants should live in the app until generalized.
- Dependencies: If a new component needs a runtime dep (e.g., a new `@radix-ui/*` package), add it to `packages/ui/package.json` and run `pnpm install`.
- Exports: If adding new folders/files, ensure `packages/ui/package.json` `exports` covers the path pattern (e.g., `"./components/*": "./src/components/*"`).

Tailwind v4 theme
- Theme source: `packages/tailwind-config/shared-styles.css` defines CSS variables, theme tokens, and layers. Apps include it via `@repo/tailwind-config`.
- Optional package CSS: `@repo/ui/styles.css` also re-exports the shared theme; prefer importing `@repo/tailwind-config` in apps.
- Keep Tailwind single-import: Keep Tailwind imported exactly once per app — via `@repo/tailwind-config`. Do not also import `tailwindcss` directly in app globals; duplicate imports cause preflight/utilities to be emitted twice and can create layout/spacing conflicts.

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
- Build: `pnpm build` (Astro + Next builds and `packages/ui` artifacts).
- Start (per app): `pnpm --filter @product/host start`.
- Lint: `pnpm lint` (ESLint, max warnings 0 in apps).
- Type-check: `pnpm check-types` (tsc --noEmit across packages/apps).
- Format: `pnpm format` (Prettier 3 + Tailwind plugin).

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Indentation: 2 spaces.
- Type safety: No `any` types. Do not use explicit `any` in apps or packages; prefer precise types, generics, `unknown`, and narrowing. The `@typescript-eslint/no-explicit-any` rule is enforced — do not disable it.

- Formatting: Prettier 3 with `prettier-plugin-tailwindcss`; run `pnpm format` before PRs.
- Linting: Shared configs in `@repo/eslint-config` with Next.js and React rules; no unused warnings in CI.
- Frameworks: React 19 across apps; Next 15 for Next apps (admin/docs/host); Astro 5 for `apps/web`. Use functional components and hooks.
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
  - Install Command: pnpm install
  - Build Command:
    - Next apps: default (Turbo auto-detected).
    - Web (Astro): configured in `apps/web/vercel.json` to run Convex deploy and inject `NEXT_PUBLIC_CONVEX_URL` before `pnpm build`.

- Required per-app vercel.json (skip unaffected builds)
  - In each app directory, add:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "ignoreCommand": "node ../../scripts/turbo-ignore.js"
}
```

- Web app specifics (`apps/web/vercel.json`):
  - `rewrites` to serve from `/app`.
  - `buildCommand`: `npx convex deploy --cmd 'pnpm build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`.

- Turborepo best practices
  - package.json name matches workspace; internal deps use workspace:*
  - turbo.json outputs: Next [".next/**", "!.next/cache/**"]; Astro ["dist/**"]; libs ["dist/**"]
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

## Next.js Apps Mounted Under a Subpath (Vercel)

When serving a Next.js app under a subpath (e.g., `/admin`, `/docs`, `/retirement`, `/enrollment-dashboard`), configure basePath and redirects so the Vercel deployment root URL works and the app renders under the subpath.

What to configure
- next.config.ts: set `basePath` and add a root redirect with `basePath: false`.
- vercel.json: use the shared ignore step and Convex build wrapper to inject `NEXT_PUBLIC_CONVEX_URL` during builds (matching other apps).
- Dependencies: keep `transpilePackages: ["@repo/ui", "@repo/backend"]` for shared code.

Example: next.config.ts
```ts
import type { NextConfig } from "next";

const isPreview = process.env.VERCEL_ENV === "preview"; // optional

const nextConfig: NextConfig = {
  basePath: "/YOUR_BASE_PATH",
  transpilePackages: ["@repo/ui", "@repo/backend"],
  async redirects() {
    // Option A (always): redirect domain root → base path in all envs
    // Option B (preview-only): return [] when !isPreview
    return [
      {
        source: "/",
        destination: "/YOUR_BASE_PATH",
        permanent: false,
        basePath: false, // critical: apply at domain root
      },
    ];
  },
};

export default nextConfig;
```

Example: vercel.json
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "ignoreCommand": "node ../../scripts/turbo-ignore.js",
  "buildCommand": "npx convex deploy --cmd 'pnpm build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL"
}
```

Why this matters
- basePath + redirect: Next.js applies `basePath` to redirects by default. Without `basePath: false`, a redirect from `/` will not apply at the domain root in Vercel previews, causing `404 NOT_FOUND`. Adding `basePath: false` makes the redirect operate at the domain root and point to your subpath.
- Convex URL injection: The `npx convex deploy --cmd 'pnpm build'` wrapper injects `NEXT_PUBLIC_CONVEX_URL` before your Next build, mirroring `apps/web` which uses the same wrapper for Astro.

Reference patterns
- Astro app (`apps/web`): uses `vercel.json` `rewrites` to serve the app under `/app` and a `buildCommand` using the Convex wrapper.
- Next apps (`admin`, `docs`, `retirement`, `enrollment-dashboard`): use `basePath` for mounting and a root redirect with `basePath: false`. Some apps gate the redirect to previews only via `VERCEL_ENV === "preview"`.

Verification checklist
- GET `/` on the preview deployment redirects to your subpath (307/308).
- GET `/<basePath>` returns 200 and renders the app.
- Build logs show the Convex deploy step injecting `NEXT_PUBLIC_CONVEX_URL`.
- `turbo-ignore` logs “⏭ Unaffected” for unaffected previews.

Common pitfalls
- Missing `basePath: false` on the `/` redirect → 404 on preview root.
- Divergent build commands between apps → inconsistent environment injection.
- Missing `transpilePackages` → shared UI/backend code fails to compile in Next apps.


## Spacing & Density Guidelines (All Apps)

Context
- Shared UI components in `packages/ui` (e.g., Card) ship with comfortable defaults (internal gap and paddings).
- Apps often need denser pages. Compounding utilities (space-y-*, gap-*, p-*) plus shared defaults can lead to overly large spacing.

Best practices
- Start with app-level overrides; change shared defaults only after repeated cross-app needs.
- Import Tailwind once: use `@repo/tailwind-config` in app globals. Avoid also importing `tailwindcss` directly.
- Watch compounding: component spacing + page spacing + grid gaps.

Recommended app density
- Containers: prefer `p-4` instead of `p-6`.
- Stacks: prefer `space-y-3` or `space-y-4` instead of `space-y-6`.
- Grids: use `gap-3` for form grids; `gap-4` for card grids; avoid `gap-6` unless necessary.
- Cards: override where used for compact density:
  - `<Card className="gap-4 py-5">`
  - `<CardHeader className="pb-4">`
  - `<CardContent className="space-y-3">` (or `space-y-4` depending on content)

When to update shared defaults (@repo/ui)
- If multiple apps consistently override the same component, consider adding a density variant (comfortable | compact) to the shared component.

Caution
- Avoid combining large page-level spacing with components that already include paddings/gaps.

Reference implementation
- `apps/enrollment-dashboard`: compact density applied across home, dashboard, uploads, intake form, and intake detail pages via app-level overrides only.
