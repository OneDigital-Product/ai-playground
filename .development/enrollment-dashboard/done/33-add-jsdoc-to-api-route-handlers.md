Title: Add JSDoc to API route handlers with error shape

Description
- Add concise JSDoc headers to all Next.js API route handlers under `apps/enrollment-dashboard/src/app/api/**/route.ts` describing method, path, input body/query, success response, error shape, and Convex side effects.

Acceptance Criteria
- Each route contains a top-level JSDoc block that standardizes:
  - Summary, Method, Path, Input, Output, Errors ({ error, fieldErrors? })
  - Notes on Convex calls where applicable
- No functional changes.

Implementation Notes
- Updated files:
  - `api/intakes/route.ts`
  - `api/intakes/[intakeId]/route.ts`
  - `api/intakes/[intakeId]/status/route.ts`
  - `api/intakes/[intakeId]/sections/[code]/route.ts`
  - `api/intakes/[intakeId]/sections/[code]/flags/route.ts`
  - `api/intakes/[intakeId]/uploads/route.ts`
  - `api/uploads/[id]/download/route.ts`
  - `api/uploads/[id]/route.ts`
  - `api/dashboard.csv/route.ts`

Dependencies
- None

Estimated Effort
- 20–30 minutes

