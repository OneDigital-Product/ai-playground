Title: Add unit tests for intakes.list filters and sorting

Description
- Add tests validating that `intakes.list` applies all filters and sorting as specified (status, complexityBand, requestor substring, planYear, requestedProductionTime, sortBy/order). Ensure results match expectations.

Acceptance Criteria
- New tests under `packages/backend/convex/functions/__tests__/intakes.list.test.ts`:
  - Seed sample fixtures for several intakes.
  - Assert filter combinations produce correct subsets.
  - Assert sorting behaves correctly for dates and strings.
- Tests pass consistently.

Implementation Notes
- Files:
  - Added helper `packages/backend/convex/functions/helpers/listFilters.ts` implementing filter & sort semantics for unit testing.
  - `intakes.list` refactored to call helper after initial index-based fetch/union.
  - Tests import the helper and verify semantics with fixture data using node:test/assert.

Dependencies
- 24-pass-dashboard-filters-to-convex.md (ensures contract is stable)
- 25-optimize-intakes-list-with-indexes.md

Estimated Effort
- 30–45 minutes

