# Remove Remaining Next Intake Routes

## Description
Remove Next.js intake routes replaced by SDK/HTTP implementations from Tasks 09–11.

Implementation steps:
1. Confirm UI is fully migrated for create/status/section per ADR.
2. Identify and remove:
   - `apps/enrollment-dashboard/src/app/api/intakes/route.ts`
   - `apps/enrollment-dashboard/src/app/api/intakes/[intakeId]/status/route.ts`
   - `apps/enrollment-dashboard/src/app/api/intakes/[intakeId]/sections/[code]/route.ts`
3. Grep for references to these routes and update callers if any remain.
4. Run lint/type-check and push to preview to verify flows.

## Prerequisites
- Tasks 09–11 completed and verified.

## Deliverables
- Next intake routes removed.

## Acceptance Criteria
- No remaining references to deleted routes.
- Intake flows work end-to-end using the chosen path.
- Monorepo lint and type-check pass.

