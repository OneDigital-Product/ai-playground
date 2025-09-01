# Web App (Astro + React)

This app is the user-facing site built with Astro 5 and React 19. It consumes shared UI primitives from `@repo/ui` and the Tailwind v4 theme from `@repo/tailwind-config`.

## Commands (scoped)

- Dev: `pnpm --filter web dev` (runs on port 3001)
- Build: `pnpm --filter web build`
- Preview: `pnpm --filter web preview`
- Lint: `pnpm --filter web lint`
- Type check: `pnpm --filter web check-types`

## Base Path and Routing

- The site is served under `/app` (see `astro.config.mjs` `base: "/app"`).
- Use relative links when possible; for absolute paths prefix with `/app/...`.
- Layout references: favicon `/app/favicon.svg`, feed `/app/rss.xml` in `src/layouts/BaseLayout.astro`.

## Styling and UI

- Global CSS imports Tailwind v4 and the shared theme in `src/styles/global.css`:
  - `@import "tailwindcss";`
  - `@import "@repo/tailwind-config";`
- PostCSS configuration is shared via `postcss.config.js` (re-exports from `@repo/tailwind-config`).
- Use shared primitives from `@repo/ui`:
  - Astro + React island example:
    ```astro
    ---
    import { Button } from "@repo/ui/components/ui/button";
    ---
    <Button client:load>Click me</Button>
    ```
  - React island example:
    ```tsx
    import { Button } from "@repo/ui/components/ui/button";

    export function ActionCTA() {
      return <Button>Continue</Button>;
    }
    ```
- App-specific components live in `src/components`. Promote only generic primitives to `packages/ui`.

## Environment Variables

- Place env files in `apps/web/.env*`. Use `apps/web/.env.local` for local-only values (do not commit).
- `astro.config.mjs` sets `envPrefix: ["VITE_", "PUBLIC_", "NEXT_PUBLIC_"]`. Use `PUBLIC_`/`NEXT_PUBLIC_` to expose variables to the client.
- Convex URL is provided as `NEXT_PUBLIC_CONVEX_URL` in deploys (see Vercel section below).

## Vercel

- `vercel.json`:
  - `ignoreCommand`: `node ../../scripts/turbo-ignore.js` to skip unaffected builds.
  - `rewrites` to make the app available at `/app`.
  - `buildCommand`: `npx convex deploy --cmd 'pnpm build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL` which deploys Convex, injects `NEXT_PUBLIC_CONVEX_URL`, then runs the Astro build.

## Project Structure (high-level)

```text
apps/web/
├── public/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   └── styles/global.css
├── astro.config.mjs
├── postcss.config.js
├── package.json
└── vercel.json
```

## Development Notes

- Prefer small React islands hydrated via `client:*` directives.
- Keep Tailwind classes aligned with shared tokens; do not add a local Tailwind config.
- Strict TypeScript: avoid `any`; prefer precise types or `unknown` with narrowing.
- Run lint and type checks before PRs.
