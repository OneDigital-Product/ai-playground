Title: Add explicit success feedback and loading progress for intake submit

Description:
- Improve perceived feedback when submitting the intake form by adding:
  - A non-blocking success toast upon redirect to the detail page (consume “?created=1”).
  - A subtle progress indicator inline with the submit button (spinner) while submitting.
  - Disable all inputs during submission to avoid accidental edits.

Acceptance Criteria:
- On submit, the button shows a spinner + “Creating Intake…”, inputs are disabled.
- After redirect to `/intakes/[id]?created=1`, a success toast appears once: “Intake created successfully”.
- No duplicate toasts on refresh; query flag is cleared post-toast.

Estimated Effort/Complexity: S

Dependencies:
- Task 01 (ensures successful path).

Relevant Files/Components:
- `apps/enrollment-dashboard/src/components/intake-form.tsx` (submitting/disabled state)
- `apps/enrollment-dashboard/src/app/intakes/[intakeId]/page.tsx` or layout (parse `created=1` and show toast)
- `apps/enrollment-dashboard/src/components/toast/*` (existing toast utilities)
