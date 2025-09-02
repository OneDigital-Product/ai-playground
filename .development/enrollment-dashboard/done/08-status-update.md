Title: Intake Status Update (Inline & Detail)

Summary
- Support changing intake status inline on the dashboard row and on the intake detail page with immediate persistence.

User Stories / Acceptance Criteria
- As an admin, I can change status via a select control without leaving the page; it persists and updates stats.
- Allowed statuses: NOT_STARTED, STARTED, ROADBLOCK, READY_FOR_QA, DELIVERED_TO_CONSULTANT.
- Errors revert UI to prior selection and show a toast.

Backend (Convex)
- Mutation: intakes:updateStatus({ intakeId, status })
  - Validates enum and updates updatedAt.
- Query: intakes:stats() to refresh counters.

Frontend (Next.js)
- Reusable StatusSelect component using @repo/ui Select.
- In dashboard row and detail page, mutate then revalidate stats and the item.
- Toast feedback via shared component.

Route Handler
- POST /enrollment-dashboard/api/intakes/[intakeId]/status (route handler in app/**/route.ts)
  - Body: { status }
  - 200 -> { success: true }

Dependencies
- 02-convex-data-model

Testing
- Unit: invalid status rejected; valid updates persist.
- Integration: stats increment/decrement as expected when status changes.

