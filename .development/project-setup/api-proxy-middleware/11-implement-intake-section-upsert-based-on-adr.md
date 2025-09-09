# Implement Intake Section Upsert Based on ADR

## Description
Implement section upsert per the ADR decision:
- SDK path: call `api.functions.sections.upsert` directly.
- HTTP path: add Convex `POST /enrollment/intakes/section` and update UI accordingly.

Implementation steps (SDK):
1. Identify `apps/enrollment-dashboard/src/app/api/intakes/[intakeId]/sections/[code]/route.ts` usages.
2. Replace with direct Convex call from UI/server code.
3. Ensure payload shape (e.g., `sectionCode`, `payload`) matches backend expectations.

Implementation steps (HTTP):
1. Add `POST /enrollment/intakes/section` in `packages/backend/convex/http.ts`.
2. Validate inputs and call `api.functions.sections.upsert`.
3. Update UI to call the new endpoint.

## Prerequisites
- Task 08 (ADR) completed.

## Deliverables
- Updated UI and/or new Convex HTTP endpoint for section upsert.

## Acceptance Criteria
- Section changes persist and appear correctly on reload.
- Lint/type-check pass.
- Tests or scripts verify success and an invalid code/payload case.

