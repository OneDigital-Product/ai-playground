# Agents Guide — apps/web

This guide is scoped to `apps/web` only. It captures how to work inside this Astro + React app using the shared Tailwind v4 theme and the shadcn/ui-based `@repo/ui` library.

## Stack & Layout
- Astro 5 with React 19 via `@astrojs/react`.
- Tailwind v4 shared theme from `@repo/tailwind-config`.
- Shared UI primitives from `@repo/ui` (shadcn/ui-based).
- TypeScript (strict) + ESLint via `@repo/eslint-config`.
- Base path: `astro.config.mjs` sets `base: "/app"`.

## Run & Env (web only)
- Dev (port 3001): `pnpm --filter web dev`
- Build: `pnpm --filter web build`
- Preview: `pnpm --filter web preview`
- Lint: `pnpm --filter web lint`
- Type check: `pnpm --filter web check-types`

Environment files live in `apps/web/.env*`. Use `.env.local` for local secrets (do not commit).

Env prefixes: Vite is configured with `envPrefix: ["VITE_", "PUBLIC_", "NEXT_PUBLIC_"]`. Use `PUBLIC_` or `NEXT_PUBLIC_` for variables exposed to the browser (e.g., `NEXT_PUBLIC_CONVEX_URL`).

## UI & Styling

**⚠️ CRITICAL: Read `TAILWIND_V4_MONOREPO_GUIDE.md` in the repo root before making UI changes to avoid spacing issues.**

- Global styles follow the single-import pattern:
  - `src/styles/global.css` imports ONLY `@repo/tailwind-config` (which includes Tailwind)
  - Do NOT import `tailwindcss` directly - this causes double import issues
- PostCSS is sourced from the shared config: see `postcss.config.js` importing `@repo/tailwind-config/postcss.config.js`.
- Use shared primitives from `@repo/ui` to keep consistency:
  - In `.astro` (with React hydration):
    ```astro
    ---
    import { Button } from "@repo/ui/components/ui/button";
    ---
    <Button client:load>Click me</Button>
    ```
  - In a React island (`.tsx`):
    ```tsx
    import { Button } from "@repo/ui/components/ui/button";

    export function ActionCTA() {
      return <Button>Continue</Button>;
    }
    ```
- App-specific UI variants belong under `src/components`. Promote only generic, low-dependency primitives to `packages/ui`.

## MCP Usage (Agents)
- Components: Use the shadcn/ui MCP server to generate or update primitives. Place shared primitives in `packages/ui/src/components/ui`. Keep app-only pieces in `apps/web`.
- Docs: Use the Context7 MCP server for Astro, React 19, Tailwind v4, Radix UI, etc.

## Routing & Base Path
- The app runs under `/app`. For absolute links and assets, prefix with `/app/...` or use relative paths.
- Layout examples: favicon at `/app/favicon.svg` and RSS at `/app/rss.xml` (see `src/layouts/BaseLayout.astro`).
- React in Astro: import React components normally and hydrate with `client:load`, `client:idle`, or `client:visible` when interactive.

## Vercel Build & Skips (web)
- `vercel.json` includes:
  - `ignoreCommand`: `node ../../scripts/turbo-ignore.js` to skip unaffected builds.
  - `rewrites` to serve the app from `/app`.
  - `buildCommand`: `npx convex deploy --cmd 'pnpm build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL` to provision `NEXT_PUBLIC_CONVEX_URL` for the Astro build.

## Conventions
- Imports:
  - UI components: `@repo/ui/components/ui/*`
  - UI utilities: `@repo/ui/lib/*`
  - Theme is applied via CSS — do not create a local Tailwind config.
- Type safety: never use `any`. Prefer precise types, generics, and `unknown` with narrowing.
- Formatting & linting: Prettier 3 (Tailwind plugin) + workspace ESLint. Keep warnings at 0.

## Common Tasks
- Add a page: create `src/pages/<route>.astro`. Use `src/layouts/BaseLayout.astro` and shared Tailwind tokens.
- Add interactive UI: create a small React island (`.tsx`) and hydrate in `.astro` via a `client:*` directive. Prefer `@repo/ui` primitives.
- Extend shared UI: if broadly useful, add to `packages/ui/src/components/ui` and export via `packages/ui/package.json`. If a new runtime dep (e.g., `@radix-ui/*`) is required, add it to `packages/ui/package.json`.

## Pre-PR Checklist (web)
- `pnpm --filter web lint`
- `pnpm --filter web check-types`
- `pnpm --filter web build`
- Conventional commit style with web scope, e.g., `feat(web): add pricing page`.

Notes
- Respect `/app` base for paths and rewrites.
- Keep React islands small; rely on Astro for static rendering.
- Do not move app-specific logic into `packages/ui`.

For broader monorepo policies, see the root `AGENTS.md`. This file stays web-scoped.
