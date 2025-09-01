# Agents Guide — apps/web

This document is scoped to the `apps/web` app only. It provides the conventions and quick refs an AI coding agent should follow when working in this Astro + React web app inside the monorepo.

## Tech Stack
- Astro 5 with React 19 integration (`@astrojs/react`)
- Tailwind CSS v4 via shared theme `@repo/tailwind-config`
- Shared UI primitives from `@repo/ui` (shadcn/ui-based)
- TypeScript (strict) + ESLint from `@repo/eslint-config`

## Run & Develop (web only)
- Dev (port 3001): `pnpm --filter web dev`
- Build: `pnpm --filter web build`
- Preview: `pnpm --filter web preview`
- Lint: `pnpm --filter web lint`
- Type check: `pnpm --filter web check-types`

Environment files live in `apps/web/.env*`. Use `.env.local` for local secrets (do not commit).

## UI & Styling (shared system)
- Global styles import Tailwind and the shared theme already:
  - `src/styles/global.css` includes `@import "tailwindcss";` and `@import "@repo/tailwind-config";`
- Prefer shared components from `@repo/ui` for consistency:
  - Example (in `.astro` with React hydration):
    ```astro
    ---
    import { Button } from "@repo/ui/components/ui/button";
    ---
    <Button client:load>Click me</Button>
    ```
  - Example (in a React `.tsx` island used by Astro):
    ```tsx
    import { Button } from "@repo/ui/components/ui/button";

    export function ActionCTA() {
      return <Button>Continue</Button>;
    }
    ```
- App-specific UI variants should live under `apps/web/src/components`. Only promote generic primitives to `packages/ui`.

## MCP Usage (Agents)
- Component scaffolding: use the shadcn/ui MCP server to generate or update primitives, placing shared pieces in `packages/ui/src/components/ui`. Keep app-only UI in `apps/web`.
- Documentation lookups: use the Context7 MCP server for framework/library docs (Astro, React 19, Tailwind v4, Radix UI, etc.).

## Project Conventions (web)
- Routing base: `astro.config.mjs` sets `base: "/app"`.
  - When using absolute URLs to static assets or links, prefix with `/app/...`, or prefer relative links when possible.
  - Existing layout uses `/app/favicon.svg` and `/app/rss.xml` as examples.
- React in Astro: import React components normally; hydrate with Astro directives like `client:load`, `client:idle`, or `client:visible` when interactive.
- Imports:
  - Shared UI: `@repo/ui/components/ui/*` and utilities from `@repo/ui/lib/*`
  - Shared theme: already applied via CSS; do not duplicate Tailwind config locally.
- Type safety: do not use `any`. Use precise types, generics, `unknown` with narrowing.
- Formatting & linting: Prettier 3 (with Tailwind plugin) and ESLint rules via workspace configs. Keep warnings at 0.

## Typical Tasks (playbook)
- Add a new page
  - Create `src/pages/<route>.astro`.
  - Use `src/layouts/BaseLayout.astro` and ensure classes use Tailwind tokens from the shared theme.
- Add interactive UI
  - Prefer a small React island (`.tsx`) imported into `.astro` with `client:*` hydration.
  - Use shared primitives from `@repo/ui` where possible.
- Extend shared UI
  - If a component is broadly useful: implement under `packages/ui/src/components/ui`, export via `packages/ui/package.json`, and then import here.
  - If it needs new runtime deps (e.g., new `@radix-ui/*`), add them to `packages/ui/package.json`.

## Verification Before PR
- Web-only checks:
  - `pnpm --filter web lint`
  - `pnpm --filter web check-types`
  - `pnpm --filter web build`
- Commit style: Conventional Commits with web scope, e.g. `feat(web): add pricing page`.
- PRs: keep focused; include description and screenshots for UI changes.

## Notes & Tips
- Asset paths: respect the `/app` base. Prefer relative paths or ensure absolute URLs are `/app/...`.
- Performance: keep React islands small and specific; lean on Astro for static rendering.
- Do not add app-specific logic to `packages/ui`. Promote only when it’s generic and low-dependency.

If you need broader repo policies (monorepo, CI, Vercel), refer to the root `AGENTS.md`. This file is intentionally web-scoped.
