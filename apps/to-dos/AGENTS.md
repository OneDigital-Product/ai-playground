To-Dos App — Agent Notes

Context
- Next.js App Router mounted under basePath `/to-dos`.
- Uses shared Tailwind v4 theme via `@repo/tailwind-config` and shadcn/ui primitives from `@repo/ui`.
- Keep spacing compact with app-level overrides; do not change shared defaults unless broadly needed.

Implementation patterns
- next.config.ts: `basePath: "/to-dos"`, add root redirect with `basePath: false`.
- Transpile `@repo/ui` and `@repo/backend` in Next to support shared packages.
- Global CSS: import Tailwind v4 once through `@repo/tailwind-config` (see `src/app/globals.css`) per Tailwind v4 monorepo guide.
- UI components: import from `@repo/ui/components/ui/*`.

Dev commands
- Dev: `pnpm --filter to-dos dev`
- Build: `pnpm --filter to-dos build`
- Lint: `pnpm --filter to-dos lint`
- Type-check: `pnpm --filter to-dos check-types`

Notes
- No backend persistence; todos are stored in `localStorage`. If this becomes shared across apps, consider a Convex-backed list with optimistic updates.

