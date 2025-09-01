Title: Add JSDoc to API route handlers with error shape

Description
- Add concise JSDoc headers to all Next.js API route handlers under `apps/enrollment-dashboard/src/app/api/**/route.ts` describing method, path, input body/query, success response, error shape, and side effects. This standardizes contracts for future maintenance.

Acceptance Criteria
- Each `route.ts` under:
  - `api/intakes/route.ts`
  - `api/intakes/[intakeId]/route.ts`
  - `api/intakes/[intakeId]/status/route.ts`
  - `api/intakes/[intakeId]/sections/[code]/route.ts`
  - `api/intakes/[intakeId]/sections/[code]/flags/route.ts`
  - `api/intakes/[intakeId]/uploads/route.ts`
  - `api/uploads/[id]/download/route.ts`
  - `api/uploads/[id]/route.ts`
  - `api/dashboard.csv/route.ts`
  includes a JSDoc block with:
  - Summary, Method, Path, Input, Output, Errors ({ error, fieldErrors? })
  - Notes on Convex calls where applicable
- No functional changes.

Implementation Notes
- Use a consistent doc template, e.g.:
  ```ts
  /**
   * POST /enrollment-dashboard/api/intakes/[intakeId]/status
   * Body: { status: 'NOT_STARTED'|'STARTED'|'ROADBLOCK'|'READY_FOR_QA'|'DELIVERED_TO_CONSULTANT' }
   * 200: { success: true }
   * 400/500: { error, fieldErrors? }
   * Side effects: Calls Convex intakes.updateStatus
   */
  ```

Dependencies
- 26-status-route-convex-integration-and-client-update.md (to document accurate behavior)

Estimated Effort
- 20–30 minutes

