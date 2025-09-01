Title: Pass dashboard filters to Convex intakes.list (remove client-only filtering)

Description
- Send the active filter set from the dashboard UI into `useQuery(api.functions.intakes.list, filtersArgs)` so the server performs filtering/sorting. Remove redundant client-side filtering where possible.

Acceptance Criteria
- `apps/enrollment-dashboard/src/app/dashboard/page.tsx` passes the current filters to `useQuery`:
  - `{ status, complexityBand, requestorName, planYear, requestedProductionTime, sortBy, order }`
- Visible rows and counts match the server-side filtered result (no double filtering needed in `IntakesTable`).
- Sorting controls update `sortBy`/`order` and are passed to Convex.

Implementation Notes
- Files:
  - `apps/enrollment-dashboard/src/app/dashboard/page.tsx`
  - `apps/enrollment-dashboard/src/components/intakes-table.tsx` (limit or remove client-side filtering; keep fallback UI)
  - Backend contract already supports `listFiltersValidator`.
- Example (client):
  ```ts
  const intakes = useQuery(api.functions.intakes.list, {
    status: filters.status,
    complexityBand: filters.complexityBand,
    requestorName: filters.requestorName || undefined,
    planYear: filters.planYear,
    requestedProductionTime: filters.requestedProductionTime,
    sortBy,
    order,
  });
  ```
- Keep UI behavior for interactive sort; just ensure it maps to server args.

Dependencies
- None (can ship before backend optimization in task 25).

Estimated Effort
- 30–45 minutes

