# Agents Guide — apps/host

This guide is scoped to the `apps/host` Next.js 15 gateway/proxy app.

**⚠️ CRITICAL: Read `TAILWIND_V4_MONOREPO_GUIDE.md` in the repo root before making ANY UI changes to avoid spacing and import issues.**

## Stack
- Next.js 15 (App Router)
- React 19
- TypeScript (strict)
- Tailwind v4 via `@repo/tailwind-config`
- Shared UI components from `@repo/ui`
- Gateway/proxy functionality

## UI & Styling Rules

### Single Import Pattern (MANDATORY)
- Global CSS imports ONLY `@repo/tailwind-config`
- NEVER import `tailwindcss` directly - this causes double import issues
- The shared config already includes Tailwind CSS

### Component Usage
- Import from `@repo/ui/components/ui/*` for all shared components
- Use density variants when available: `density="auto"` (no spacing), `density="compact"`, or `density="comfortable"`
- App controls spacing by default - add explicit spacing classes when needed

## Development
- Dev: `pnpm --filter @product/host dev`
- Build: `pnpm --filter @product/host build`
- Start: `pnpm --filter @product/host start`
- Lint: `pnpm --filter @product/host lint`
- Type check: `pnpm --filter @product/host check-types`

## Configuration
- `next.config.ts` includes `transpilePackages: ["@repo/ui", "@repo/backend"]`
- Environment variables in `.env.local` (not committed)
- See `.env.local.example` for required env vars

For monorepo-wide guidelines, see root `AGENTS.md`.
