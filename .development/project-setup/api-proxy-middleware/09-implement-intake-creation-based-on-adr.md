# Implement Intake Creation Based on ADR

## Description
Implement intake creation per the ADR decision:
- SDK path: call Convex mutation directly from app components/server code; remove Next route.
- HTTP path: add Convex HTTP endpoint `POST /enrollment/intakes` and update UI to call it.

Implementation steps (SDK):
1. Identify current usage of `apps/enrollment-dashboard/src/app/api/intakes/route.ts`.
2. Replace with direct call to Convex client in the relevant UI/server action.
3. Preserve validation and error handling (move client-side validation to UI; server-side to Convex function).
4. Remove obsolete Next route (see Task 12).

Example (SDK sketch):
```ts
import { api } from "convex/_generated/api";
import { ConvexHttpClient } from "convex/browser"; // or server variant

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const result = await convex.mutation(api.functions.intakes.create, intakeArgs);
```

Implementation steps (HTTP):
1. Add Convex `POST /enrollment/intakes` in `packages/backend/convex/http.ts`.
2. Parse and validate JSON body; call `api.functions.intakes.create` via `ctx.runMutation`.
3. Update UI to call the new HTTP endpoint.
4. Remove obsolete Next route (see Task 12).

## Prerequisites
- Task 08 (ADR) completed.

## Deliverables
- Updated UI and/or new Convex HTTP endpoint.
- Validation preserved and errors surfaced correctly.

## Acceptance Criteria
- Creating an intake works end-to-end with expected validation.
- Lint/type-check pass.
- Tests or scripted checks verify success and a representative failure case.

