Title: Consolidate requestor names into shared constant

Description
- Move the duplicated requestor names array into a shared module and import it in both the form and the API route. Avoids drift and centralizes updates.

Acceptance Criteria
- New module `apps/enrollment-dashboard/src/lib/constants.ts` exports `REQUESTOR_NAMES` (as `readonly` tuple type).
- `apps/enrollment-dashboard/src/components/intake-form.tsx` imports from the shared module.
- `apps/enrollment-dashboard/src/app/api/intakes/route.ts` imports from the same module and validates against it.
- Builds and type-checks pass.

Implementation Notes
- Files:
  - Add: `apps/enrollment-dashboard/src/lib/constants.ts`
  - Update imports in:
    - `apps/enrollment-dashboard/src/components/intake-form.tsx`
    - `apps/enrollment-dashboard/src/app/api/intakes/route.ts`
- Example constants file:
  ```ts
  export const REQUESTOR_NAMES = [
    "John Doe","Jane Smith","Mike Johnson","Sarah Wilson","David Brown",
    "Lisa Garcia","Robert Davis","Emily Chen","Tom Anderson","Maria Rodriguez"
  ] as const;
  export type RequestorName = typeof REQUESTOR_NAMES[number];
  ```

Dependencies
- None

Estimated Effort
- 20–30 minutes

