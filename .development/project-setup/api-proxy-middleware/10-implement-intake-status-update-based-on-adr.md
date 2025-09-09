# Implement Intake Status Update Based on ADR

## Description
Implement intake status updates per the ADR decision:
- SDK path: call Convex mutation `api.functions.intakes.updateStatus` directly from UI/server code.
- HTTP path: add Convex `POST /enrollment/intakes/status` and update UI to call it.

Implementation steps (SDK):
1. Identify usage of `apps/enrollment-dashboard/src/app/api/intakes/[intakeId]/status/route.ts`.
2. Replace with direct Convex mutation from UI/server action.
3. Ensure payload shape and validation match existing Convex function.

Implementation steps (HTTP):
1. Add `POST /enrollment/intakes/status` in `packages/backend/convex/http.ts`.
2. Parse JSON body and call `api.functions.intakes.updateStatus`.
3. Update UI to call the new endpoint.

## Prerequisites
- Task 08 (ADR) completed.

## Deliverables
- Updated UI and/or new Convex HTTP endpoint for status updates.

## Acceptance Criteria
- Status changes persist and are reflected in the UI.
- Lint/type-check pass.
- Tests or scripts verify success and an invalid input case.

