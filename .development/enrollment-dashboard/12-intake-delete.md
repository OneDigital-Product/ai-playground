Title: Delete Intake (Cascade Sections & Files)

Summary
- Allow admins to delete an intake. Deletion cascades to section details and uploaded files.

User Stories / Acceptance Criteria
- As an admin, I can delete an intake from the dashboard row actions and from the intake detail page.
- I’m prompted to confirm; on success, I see a success toast and the list refreshes without the item.
- All associated section_details and uploads are removed. Stored files are deleted from Convex storage.
- If the intake doesn’t exist, I receive a 404.

Backend (Convex)
- Mutation: intakes:delete({ intakeId })
  - Deletes uploads (including storage objects), sections, then the intake record.
- Supporting queries/mutations (used internally):
  - uploads:listByIntake({ intakeId }) -> for cleanup
  - uploads:delete({ id }) -> deletes doc + storage
  - sections:deleteByIntake({ intakeId })

Frontend (Next.js)
- UI: Delete buttons in dashboard Actions column and on detail header.
- Flow: Confirm dialog (AlertDialog from @repo/ui). On confirm, call a mutation then refresh list or navigate back to /dashboard.

Route Handler
- DELETE /enrollment-dashboard/api/intakes/[intakeId] (route handler in app/**/route.ts)
  - 200 -> { success: true }
  - 404 -> { error: 'Not found' }

Dependencies
- 02-convex-data-model

Testing
- Integration: deleting an intake removes it from dashboard and detail route returns 404.
- Unit: mutation deletes dependent records and storage objects even if some deletes fail (ensure idempotency/transactional behavior).

