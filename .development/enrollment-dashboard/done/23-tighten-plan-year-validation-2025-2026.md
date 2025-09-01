Title: Tighten plan year validation to 2025–2026 (frontend + backend)

Description
- Align plan year validation to the requirements by restricting to 2025–2026 in both the frontend Zod schema and the backend Convex validator. Update UI hints accordingly.

Acceptance Criteria
- Frontend validation fails for plan years outside 2025–2026 with a clear error.
- Backend `validatePlanYear` rejects values outside 2025–2026.
- Dashboard filters UI shows min/max hints that match this range.
- `pnpm check-types` passes.

Implementation Notes
- Files:
  - Frontend: `apps/enrollment-dashboard/src/lib/schemas.ts`
    - Change `planYear: z.coerce.number().min(2025).max(2026)`
  - Backend: `packages/backend/convex/validators/shared.ts`
    - Update `validatePlanYear` range to 2025–2026.
  - UI: `apps/enrollment-dashboard/src/components/dashboard-filters.tsx`
    - Input props and helper text (min/max) adjusted to 2025–2026.
- Keep error shape consistent (`{ error, fieldErrors? }`).

Dependencies
- None

Estimated Effort
- 20–30 minutes

