# Remove Next Routes for CSV, Download, and Delete

## Description
Remove redundant Next.js API routes now replaced by Convex endpoints:
- `apps/enrollment-dashboard/src/app/api/dashboard.csv/route.ts`
- `apps/enrollment-dashboard/src/app/api/uploads/[id]/download/route.ts`
- `apps/enrollment-dashboard/src/app/api/uploads/[id]/route.ts`

Implementation steps:
1. Confirm UI has switched to Convex endpoints (Tasks 01, 02, 05) and passes verification in preview.
2. Grep for any code referencing the above routes; update or remove references.
3. Delete the files listed above.
4. Run lint and type-check; fix any stragglers.
5. Push to preview and verify flows still work.

## Prerequisites
- Tasks 01–05 completed and verified in preview.

## Deliverables
- Next routes removed from the codebase.
- Commit message links to Convex endpoint replacements.

## Acceptance Criteria
- No remaining references to deleted routes.
- CSV export, file download, and delete operate correctly via Convex in preview.
- Monorepo lint and type-check pass.

