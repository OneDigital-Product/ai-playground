Title: Wire POST /api/intakes to Convex create (remove mock ID)

Description
- Replace the mock response in `POST /enrollment-dashboard/api/intakes` with a real Convex call to `api.functions.intakes.create`. Return the created `intakeId` from Convex so the client navigates to a real record.

Acceptance Criteria
- Submitting the New Intake form persists a new record in Convex and redirects to `/enrollment-dashboard/intakes/<EG-YYYY-XXXX>?created=1`.
- The API route no longer returns a mock `INT-...` id.
- Errors from Convex are returned as `{ error, fieldErrors? }` with appropriate status codes (400 for validation, 500 otherwise).

Implementation Notes
- Files:
  - `apps/enrollment-dashboard/src/app/api/intakes/route.ts`
  - Backend already implemented: `packages/backend/convex/functions/intakes.ts:create`
- Suggested implementation (example):
  ```ts
  import { ConvexHttpClient } from "convex/browser";
  import type { FunctionReference } from "convex/server";
  import { api } from "@repo/backend/convex/_generated/api";

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  export async function POST(request: NextRequest) {
    const body = await request.json();
    const validation = validateIntakeCreate(body);
    if (!validation.success) {
      return NextResponse.json(validation.error, { status: 400 });
    }

    try {
      const result = await convex.mutation(
        api.functions.intakes.create as FunctionReference<"mutation">,
        validation.data
      );
      return NextResponse.json({ intakeId: result.intakeId }, { status: 201 });
    } catch (err) {
      // Map validation and other errors
      const message = err instanceof Error ? err.message : "Unknown error";
      const status = /required|invalid|validation/i.test(message) ? 400 : 500;
      return NextResponse.json({ error: message }, { status });
    }
  }
  ```
- Keep the existing requestor name enum validation for now (or refactor in task 28).

Dependencies
- None (can be completed independently).

Estimated Effort
- 30–45 minutes

