Title: Enrollment Dashboard — Feature Requirements Index & Implementation Order

Purpose
- This index outlines the ordered, dependency-aware plan to implement the Enrollment Dashboard (Next.js + Convex) based on the analyzed Express app at temp/EnrollmentGuideDashboard.
- Each feature is a complete, testable unit with its own requirements document.

Implementation Order (Foundations → Features)
1) 02-convex-data-model.md — Data model and Convex function surface (foundational)
2) 03-admin-access-no-auth.md — Admin dashboard access (no app-level authentication during migration)
3) 04-shared-types-and-validation.md — Shared enums, Zod schemas, convex/values validators
4) 05-complexity-scoring-and-banding.md — Deterministic complexity algorithm
5) 06-intake-create.md — New intake form (SSR + client enhancements)
6) 07-intake-detail-and-sections-view.md — Intake detail (Overview/Sections tabs)
7) 08-status-update.md — Inline status updates (dashboard + detail)
8) 09-dashboard-list-and-filters.md — Dashboard list, filters, sorting, stats, CSV export
9) 10-section-editing.md — Per-section edit/upsert after creation
10) 11-file-uploads-and-downloads.md — Upload, list, download, delete files
11) 12-intake-delete.md — Delete intake (cascade sections + files)

Cross-Cutting Conventions
- Frontend: Next.js (App Router) under basePath /enrollment-dashboard. Use @repo/ui (shadcn/ui primitives) + shared Tailwind v4 theme.
- Backend: Convex functions in packages/backend; follow repo memory guidance for deployment wiring.
- Styling: Align with existing monorepo patterns; no ad-hoc Tailwind configs in the app.
- Routing/Handlers: Use Next route handlers (app/**/route.ts) or server actions ("use server") as thin wrappers around Convex queries/mutations/actions; consistent error shape { error, fieldErrors? }.
- IDs: Human-friendly intakeId string (e.g., INTAKE-YYYYMMDD-XXXX) generated at creation (see idGenerator parity).

Mapping (Express → Next/Convex)
- No app-level login/logout — authentication is handled at the monorepo/gateway layer during migration
- GET /dashboard, GET /dashboard/export.csv, GET /dashboard/stats → 09-dashboard-list-and-filters (+ 08-status-update for inline updates)
- GET /intakes/new, POST /intakes → 06-intake-create
- GET /intakes/:intakeId → 07-intake-detail-and-sections-view
- POST /intakes/:intakeId/status → 08-status-update
- POST /intakes/:intakeId/sections/:code → 10-section-editing
- POST /intakes/:intakeId/uploads, GET /uploads/:id/download, DELETE /uploads/:id → 11-file-uploads-and-downloads
- DELETE /intakes/:intakeId → 12-intake-delete

Testing Strategy
- Unit tests for Convex queries/mutations/actions and helpers (complexity, CSV escaping, filters parsing).
- Integration/E2E covering critical flows: intake creation, status change, filters/sorting, section edits, file uploads, deletion.

Notes
- CSV export columns match Express implementation.
- Stats include total, by_status, by_complexity, and last-7-days recent_count.
- Section definitions A–Q mirror Express controller; editing uses simplified change_description payloads.

