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

Use this checklist when adding new apps to ensure optimal build performance and caching on Vercel.

### 1) Vercel Project Setup Requirements
- Root Directory: set to the app folder
  - apps/web
  - apps/docs
  - apps/admin
  - apps/host
- Build Command: Vercel should auto-detect Turborepo and run `turbo run build` with proper scoping. If customizing, keep the default unless you have a specific reason.
- Install Command: ensure the correct package manager is used
  - pnpm install
- Framework Preset: Next.js should be detected automatically; do not override unless necessary.

### 2) Required per-app vercel.json
Create a vercel.json in each new app directory that uses the zero-download ignore step so unaffected apps are skipped immediately on each commit.

JSON to add to each app (e.g., apps/web/vercel.json):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "ignoreCommand": "node ../../scripts/turbo-ignore.js"
}
```

Notes
- The script `scripts/turbo-ignore.js` runs without installing anything and checks if the app or its in-repo workspace dependencies changed between the last two commits.
- Exit code behavior:
  - 0: Unaffected — Vercel skips the build (Ignored Build Step)
  - 1: Affected — Vercel proceeds with the build

### 3) Turborepo Configuration Best Practices
- Package naming:
  - Ensure the app's package.json "name" matches your workspace structure (e.g., "web", "docs", "@product/host", etc.).
- Workspace deps:
  - For internal packages, use the workspace protocol (e.g., "@repo/ui": "workspace:*"). This lets turbo and pnpm properly link and detect dependency changes.
- turbo.json outputs:
  - Next.js apps typically:
    - outputs: [".next/**", "!.next/cache/**"]
  - Libraries/packages typically:
    - outputs: ["dist/**"] (and any other build artifacts specific to the package)
- Global cache stability (optional but recommended):
  - Keep these in root turbo.json to reduce spurious cache misses when lockfiles/envs change:
    - globalDependencies: ["pnpm-lock.yaml", "pnpm-workspace.yaml"]
    - globalEnv: ["NODE_ENV", "VERCEL_ENV"]

### 4) Verification Steps
- Skipping unaffected apps:
  - Push a commit that only touches one app (e.g., apps/host/README.md).
  - Expect other apps to show Ignored Build Step with:
    - Running "node ../../scripts/turbo-ignore.js"
    - "⏭ Unaffected: no relevant changes detected"
- Affected app builds with remote caching:
  - For the app you changed, the script prints "✓ Affected: relevant changes detected" and Vercel proceeds.
  - In the build logs you should see:
    - "Detected Turbo. Adjusting default settings..."
    - "Remote caching enabled"
    - Cache hits for unchanged packages (e.g., @repo/ui) and minimal rebuild work
- Zero-download confirmation:
  - There should be no lines like "npm warn exec ... will be installed: turbo-ignore@..." during the ignore step.

### 5) Troubleshooting & Tips
- Apps building unnecessarily:
  - Confirm each app has a vercel.json with the ignoreCommand above.
  - Ensure the app’s package.json name and workspace dependencies are correct (workspace:* for internal deps).
  - Validate that non-app files (e.g., README.md) aren’t falsely considered triggers by the ignore script. By default, the script only watches the app dir, its workspace deps, pnpm-lock.yaml, and turbo.json.
- Debugging the ignore script:
  - The script logs which paths it considers: "≫ turbo-ignore (zero-download): checking paths -> ..."
  - If in doubt, run locally from an app directory: `node ../../scripts/turbo-ignore.js` and verify exit code 0/1 (0 means skip).
  - If there’s no previous commit or an error occurs, the script fails open (exit 1) to ensure builds are not skipped by accident.
- Performance indicators to monitor:
  - Time to hit Ignored Build Step (should be near-instant, no network installs).
  - Overall build time for affected apps.
  - Turborepo cache hit rate (look for "cache hit, replaying logs" vs "cache miss, executing").
  - Vercel “Creating build cache” duration — should be reasonable and stable between builds.

Checklist for adding a new app
- [ ] Create app under apps/<name> with proper package.json name
- [ ] Use workspace:* for internal dependencies
- [ ] Add apps/<name>/vercel.json as above (ignoreCommand -> local script)
- [ ] No custom Build/Install commands unless required (let Vercel/Turbo defaults work)
- [ ] If the app has unique outputs, update turbo.json outputs accordingly
- [ ] Verify: push a targeted change and confirm other apps are skipped and the changed app builds with remote caching
