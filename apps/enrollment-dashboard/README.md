Enrollment Dashboard (Next.js + Convex)

Overview
- Tracks Enrollment Guide intakes and operations: create, configure sections, upload files, update status, and export CSV.
- Next.js App Router app mounted under `/enrollment-dashboard` (see `next.config.ts`). Uses shared `@repo/ui` components and Tailwind v4 theme.
- Backend data via Convex functions in `packages/backend/convex`. Convex URL is injected during build on Vercel.

Features
- Dashboard: sortable/filtered list, stats header, CSV export.
- Intake Create: single-page form with Zod validation; computes complexity; redirects to detail on success.
- Intake Detail: Overview (basic info, complexity, pages required, uploads) and Sections tabs.
- Status Update: inline select on dashboard rows and on detail page.
- Section Editing: per-section description upsert; change/include flags.
- Uploads: multi-file upload with size/type validation; list, download, delete.
- Delete Intake: cascades sections and uploaded files.

Routing & Base Path
- Base Path: `/enrollment-dashboard` in `next.config.ts`.
- Root Redirect: redirect `/` → `/enrollment-dashboard` with `basePath: false` so previews work at the domain root.
- Vercel Build: `apps/enrollment-dashboard/vercel.json` uses Convex wrapper:
  - `npx convex deploy --cmd 'pnpm build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`

Data Access
- SDK (Convex client):
  - Intake Create: `api.functions.intakes.create`
  - Status Update: `api.functions.intakes.updateStatus`
  - Section Upsert: `api.functions.sections.upsert`
  - Section Flags: `api.functions.intakes.updateSectionFlags`
  - Queries: `api.functions.intakes.get`, `api.functions.sections.getByIntake`, `api.functions.intakes.list`, etc.
- Next routes (temporary):
  - Intake Delete: `DELETE /enrollment-dashboard/api/intakes/[intakeId]` (calls Convex action `intakes.deleteIntake`)
- Convex HTTP endpoints (server-hosted on `<your>.convex.site`):
  - Uploads Create: `POST /enrollment/uploads?intakeId=...&kind=GUIDE|PLAN_DOC|PAYROLL_SCREEN|OTHER` (body: file blob)
  - Upload Delete: `DELETE /enrollment/uploads?id=<uploadId>`
  - Upload Download (redirect): `GET /enrollment/uploads/download?id=<uploadId>`
  - CSV Export: `GET /enrollment/dashboard.csv?{filters}` returns `text/csv`

Schemas & Types
- Frontend Zod: `apps/enrollment-dashboard/src/lib/schemas.ts` (enums, IntakeCreate, status update, filters, sectionDescriptions). Communications Add‑Ons is a Checkbox multi‑select supporting `OE Letter`, `OE Presentation`, and `Other` with custom text.
- Shared constants: `apps/enrollment-dashboard/src/lib/constants.ts` (`REQUESTOR_NAMES`).
- Backend validators: `packages/backend/convex/validators/shared.ts`.

Convex Functions (overview)
- Intakes: `create`, `get`, `list`, `updateStatus`, `updateSectionFlags`, `stats`, `deleteIntake`, `exportCsv`.
- Sections: `upsert`, `getByIntake`, `bulkCreate`, `deleteByIntake`.
- Uploads: `uploadFile`, `create`, `listByIntake`, `get`, `deleteUpload`, `getDownloadUrl`.

Setup & Local Development
- Prereqs: Node 18+, pnpm, Convex CLI (`npm i -g convex` optional for local).
- Install deps: `pnpm install`
- Start Convex dev (backend): `pnpm --filter @repo/backend exec npx convex dev`
  - Copy the printed URL to `apps/enrollment-dashboard/.env.local` as `NEXT_PUBLIC_CONVEX_URL`
- Run the app: `pnpm --filter enrollment-dashboard dev`
- Lint: `pnpm lint`
- Type-check: `pnpm check-types`

Smoke Tests
- CSV/Uploads: `pnpm smoke:csv` (requires `NEXT_PUBLIC_CONVEX_URL` set; uses Convex HTTP endpoints).
- Intakes (create → status → section): `pnpm smoke:intakes` (requires `NEXT_PUBLIC_CONVEX_URL`; uses Convex SDK).

Environment Variables
- Required: `NEXT_PUBLIC_CONVEX_URL` (Convex deployment URL). In Vercel, injected automatically by the Convex wrapper in `vercel.json`. In local dev, supply via `.env.local`.

Build & Deployment
- Build (local): `pnpm --filter enrollment-dashboard build`
- Vercel: Uses `vercel.json` build command shown above; ensure `CONVEX_DEPLOY_KEY` is set in the Vercel project.

Design System & Shared UI
- Components from `@repo/ui` (shadcn/ui primitives and AppShell). Tailwind v4 theme via `@repo/tailwind-config` imported in `src/app/globals.css`.
- Spacing: Use Card `density="compact"` throughout for consistency (see `apps/enrollment-dashboard/COMPONENT_FIXES.md`).

Relationship to Other Apps
- Depends on `packages/backend` (Convex) for data and `packages/ui` for shared UI.
- Coexists with `apps/host` (base site), `apps/admin`, `apps/web` (Astro), etc. Monorepo scripts in root `package.json` manage dev/build across apps.

Requirements & Tasks
- See `.development/enrollment-dashboard` for requirements and implementation notes (done/ contains completed items).
