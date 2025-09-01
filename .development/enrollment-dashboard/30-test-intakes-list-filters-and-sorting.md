Title: Add unit tests for intakes.list filters and sorting

Description
- Add tests validating that `intakes.list` applies all filters and sorting as specified (status, complexityBand, requestor substring, planYear, requestedProductionTime, sortBy/order). Ensure results match expectations.

Acceptance Criteria
- New tests under `packages/backend/convex/functions/__tests__/intakes.list.test.ts` (or similar) that:
  - Seed in-memory fixtures or mock data for several intakes.
  - Assert filter combinations produce correct subsets.
  - Assert sorting behaves correctly for dates and strings.
- Tests pass consistently.

Implementation Notes
- Files:
  - `packages/backend/convex/functions/intakes.ts`
  - Add tests in a colocated `__tests__` folder or similar pattern used by `complexity.test.ts`.
- Consider adding light helper to build fake intake objects (not DB) and unit-test the filter/sort pure logic separately from DB calls if easier to isolate.

Dependencies
- 24-pass-dashboard-filters-to-convex.md (ensures contract is stable)
- 25-optimize-intakes-list-with-indexes.md (optional but recommended)

Estimated Effort
- 30–45 minutes

