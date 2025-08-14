AGENTS GUIDE (ai-playground)

Build/dev/run: dev (npm run dev: convex+astro), astro (npm run dev:astro), convex (npm run dev:convex), build (npm run build), preview (npm run preview), typecheck (npm run typecheck), format (npm run format).

Tests: none configured. If adding Vitest: npx vitest run; single file: npx vitest run path/to/file.test.ts; single test: npx vitest run -t "name".

Code style:

- Prettier governs formatting (plugins: prettier-plugin-astro, prettier-plugin-tailwindcss); don’t hand-format.
- TS strict (extends astro/tsconfigs/strict); React JSX (jsx: react-jsx, jsxImportSource: react).
- Imports: use @/\* alias; prefer type-only imports; avoid deep relative chains.
- Naming: Components PascalCase; vars/functions camelCase; files consistent; index names by_field1_and_field2.
- Types/validation: avoid any; prefer precise types; zod on client/edge; Convex validators for args and returns (use v.null() when needed).
- Errors/async: throw unrecoverable, never swallow; log via src/lib/logger; use await + try/catch; don’t ignore promises.

Convex (Cursor rules): see .cursor/rules/convex_rules.mdc — use new function syntax; internalQuery/Mutation/Action for private; prefer withIndex over filter; pagination helpers; storage via ctx.storage; cron via cronJobs.

Linting: ESLint not set up; if added, let Prettier handle formatting and keep TS strict.
