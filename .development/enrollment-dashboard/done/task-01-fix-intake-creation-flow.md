Title: Fix intake creation flow end-to-end

Description:
- Ensure the primary flow “Create Intake” completes successfully in local dev and preview.
- When required fields are valid, submitting should create the intake via API and navigate to `/enrollment-dashboard/intakes/[intakeId]?created=1`.
- On infrastructure/config errors (e.g., missing `NEXT_PUBLIC_CONVEX_URL` or backend failure), present a clear, actionable error message without losing user input.

Acceptance Criteria:
- With valid inputs, clicking “Create Intake” results in a 201 from `POST /enrollment-dashboard/api/intakes` and redirects to the intake detail page.
- If the API responds 4xx, the top error banner displays the server message; focus moves to the banner; fields remain intact.
- If the API responds 5xx or request fails (network/env), show a distinct error explaining the likely cause (Convex URL not configured or backend unavailable) and how to proceed.
- No duplicate submissions when clicking submit multiple times; the submit button shows a disabled “Creating Intake…” state until resolution.

Estimated Effort/Complexity: M

Dependencies:
- None (unblocks multiple downstream UX tasks).

Relevant Files/Components:
- `apps/enrollment-dashboard/src/components/intake-form.tsx` (submission + UX states)
- `apps/enrollment-dashboard/src/app/api/intakes/route.ts` (API success/error semantics)
- `apps/enrollment-dashboard/next.config.ts` and app env setup (Convex URL)
