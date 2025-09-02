Enrollment Dashboard (Next.js + Convex)

Overview
- Next.js App Router app mounted under `/enrollment-dashboard` (see `next.config.ts`). Uses shared `@repo/ui` components and Tailwind v4 theme.
- Backend data via Convex functions in `packages/backend/convex`. Convex URL is injected during build on Vercel.

Features
- Dashboard: sortable/filtered list, stats header, CSV export.
- Intake Create: single-page form; computes complexity; redirects to detail on success.
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

API Routes (thin wrappers)
- Create Intake: `POST /enrollment-dashboard/api/intakes`
  - Body: IntakeCreate (see schemas)
  - 201: `{ intakeId }`
  - 400/500: `{ error, fieldErrors? }`
- Intake Delete: `DELETE /enrollment-dashboard/api/intakes/[intakeId]`
  - 200: `{ success: true }` | 404: `{ error }`
- Status Update: `POST /enrollment-dashboard/api/intakes/[intakeId]/status`
  - Body: `{ status }`
  - 200: `{ success: true }`
- Section Upsert: `POST /enrollment-dashboard/api/intakes/[intakeId]/sections/[code]`
  - Body: `{ change_description? }`
  - 200: `{ success: true }`
- Section Flags: `POST /enrollment-dashboard/api/intakes/[intakeId]/sections/[code]/flags`
  - Body: `{ changed?: boolean, included?: boolean }`
  - 200: `{ success: true }`
- Uploads Create: `POST /enrollment-dashboard/api/intakes/[intakeId]/uploads`
  - FormData: `kind`, `files[]` (max 10, 25MB each, PDF/DOCX/XLSX/PNG/JPG)
  - 200: `{ files: [...], errors? }`
- Upload Download: `GET /enrollment-dashboard/api/uploads/[id]/download` (302 to signed URL)
- Upload Delete: `DELETE /enrollment-dashboard/api/uploads/[id]` → `{ success: true }`
- CSV Export: `GET /enrollment-dashboard/api/dashboard.csv?{filters}` returns `text/csv` (server-sorted by `sortBy/order`).

Schemas & Types
- Frontend Zod: `apps/enrollment-dashboard/src/lib/schemas.ts` (enums, IntakeCreate, status update, filters, sectionDescriptions).
- Shared constants: `apps/enrollment-dashboard/src/lib/constants.ts` (`REQUESTOR_NAMES`).
- Backend validators: `packages/backend/convex/validators/shared.ts`.

Convex Functions (overview)
- Intakes: `create`, `get`, `list`, `updateStatus`, `updateSectionFlags`, `stats`, `deleteIntake`, `exportCsv`.
- Sections: `upsert`, `getByIntake`, `bulkCreate`, `deleteByIntake`.
- Uploads: `uploadFile`, `create`, `listByIntake`, `get`, `deleteUpload`, `getDownloadUrl`.

Local Development
- Install: `pnpm install`
- Run dev: `pnpm --filter enrollment-dashboard dev`
- Start all apps: `pnpm dev`
- Convex dev (backend): `pnpm --filter @repo/backend exec npx convex dev`
- Lint: `pnpm lint`
- Type-check: `pnpm check-types`

Environment
- `NEXT_PUBLIC_CONVEX_URL` required. In Vercel, provided by the Convex wrapper in `vercel.json`.

Design System
- Components from `@repo/ui`, Tailwind v4 theme via `@repo/tailwind-config` (see `src/app/globals.css`).

Requirements & Tasks
- See `.development/enrollment-dashboard` for requirements and implementation tasks (done/ contains completed items).
