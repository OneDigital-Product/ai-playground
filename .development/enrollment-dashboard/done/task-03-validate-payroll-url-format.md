Title: Add URL format validation for Payroll Storage URL

Description:
- Strengthen client-side validation so `Payroll Storage URL` must be a valid `http(s)` URL, with a clear inline message.
- Preserve the current required validation and show the error near the input.

Acceptance Criteria:
- Entering `not-a-url` shows an inline error (e.g., “Enter a valid URL including http(s)://”).
- Valid examples such as `https://storage.company.com/path` pass without error.
- Error message is announced to screen readers (aria-live or associated with input) and is keyboard accessible.
- No regression to other intake validations.

Estimated Effort/Complexity: S

Dependencies:
- None.

Relevant Files/Components:
- `apps/enrollment-dashboard/src/lib/schemas.ts` (Zod: replace `string().min(1)` with `.url()` plus `.refine` for http/https if desired)
- `apps/enrollment-dashboard/src/components/intake-form.tsx` (error display remains)
