# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a Turborepo monorepo with pnpm workspaces. TypeScript (strict) across all packages/apps.

**Apps Structure:**
- `apps/web/` - Astro 5 + React 19 (served under `/app`)
- `apps/admin/` - Next.js 15 admin app (App Router)
- `apps/docs/` - Next.js 15 docs site (App Router) 
- `apps/host/` - Next.js 15 gateway/proxy app (main domain owner)
- `apps/retirement/` - Next.js 15 app (served under `/retirement`)
- `apps/enrollment-dashboard/` - Next.js 15 app (served under `/enrollment-dashboard`)
- `apps/to-dos/` - Next.js 15 to-do app

**Shared Packages:**
- `packages/ui/` - Shared React UI components (shadcn/ui + Tailwind v4)
- `packages/backend/` - Convex backend functions and types
- `packages/eslint-config/` - Shared ESLint configuration
- `packages/tailwind-config/` - Shared Tailwind v4 theme & PostCSS config
- `packages/typescript-config/` - Shared TypeScript configurations

## Key Development Commands

**Installation & Development:**
```bash
pnpm install                    # Install all dependencies
pnpm dev                        # Run all apps in development
pnpm dev:proxy                  # Run proxy setup (host:3000, web:3001, admin:3002)
pnpm --filter [app-name] dev    # Run single app
```

**Quality & Building:**
```bash
pnpm build                      # Build all apps
pnpm lint                       # ESLint (max warnings 0)
pnpm check-types               # TypeScript type checking
pnpm format                    # Prettier 3 + Tailwind plugin
```

**Testing:**
```bash
pnpm smoke:csv                 # CSV/uploads smoke test
pnpm smoke:intakes             # Intakes smoke test
```

## Critical Configuration Rules

**Tailwind v4 (CRITICAL):**
- Import shared theme ONCE per app: `@import "@repo/tailwind-config";` in globals.css
- NEVER import `tailwindcss` directly in app CSS files
- See `TAILWIND_V4_MONOREPO_GUIDE.md` for detailed spacing patterns

**Next.js Apps:**
- Always include: `transpilePackages: ["@repo/ui", "@repo/backend"]` in next.config.ts
- Apps with sub-paths need `basePath` + root redirect with `basePath: false`

**Component Usage:**
- Import UI components from subpaths: `@repo/ui/components/ui/button`
- Use shadcn/ui MCP server for generating/updating components
- Place shared components in `packages/ui`, app-specific ones in app directories

## Backend System (Convex)

**Key Functions:**
- `intakes.ts` - Intake form management
- `uploads.ts` - File upload handling  
- `sections.ts` - Section configuration
- `retirementPlans.ts` - Retirement plan data

**Development:**
```bash
pnpm --filter @repo/backend dev     # Start Convex dev server
pnpm --filter @repo/backend deploy  # Deploy to Convex
```

## Host Gateway Architecture

`apps/host/` is the main domain owner that proxies to other apps:
- Redirects: `/` → `/app` (production only)
- Rewrites: `/app/*` → web app, `/admin/*` → admin app

Environment variables needed:
```
WEB_ORIGIN=https://web-<id>.vercel.app
ADMIN_ORIGIN=https://admin-<id>.vercel.app  
REPORTING_ORIGIN=https://aks.example.com
```

## Routing & Base Paths

- Web app: served from `/app` base path
- Admin: served from `/admin` base path
- Retirement: served from `/retirement` base path
- Enrollment Dashboard: served from `/enrollment-dashboard` base path

## Code Quality Standards

- TypeScript strict mode - never use `any`
- ESLint max warnings: 0
- Prettier 3 with Tailwind plugin for formatting
- Conventional Commits for PRs: `feat(web): add profile page`

## Vercel Deployment

Each app needs `vercel.json` with:
```json
{
  "ignoreCommand": "node ../../scripts/turbo-ignore.js"
}
```

Web app includes Convex build wrapper for deployment.

## Agent Integration

- Use shadcn/ui MCP server for UI component generation
- Use Context7 MCP server for framework/library documentation lookups
- See `AGENTS.md` for detailed repository guidelines