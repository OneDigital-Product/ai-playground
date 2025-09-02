Title: Focus management on submit errors (WCAG 2.4.3 / 3.3.1)

Description:
- When the intake form submit fails client-side validation, move keyboard focus to the error banner and announce the error via `aria-live`.
- Also programmatically focus the first invalid field so users can correct it quickly.

Acceptance Criteria:
- Submitting with missing fields places focus on the top error summary (visible focus) and announces via screen reader.
- Pressing Tab after the error summary moves focus to the first invalid field.
- Meets WCAG 2.1 AA expectations for error identification and focus order.

Estimated Effort/Complexity: S

Dependencies:
- None (complements Task 01/03/04).

Relevant Files/Components:
- `apps/enrollment-dashboard/src/components/intake-form.tsx` (error banner ref + focus, compute first invalid field)
