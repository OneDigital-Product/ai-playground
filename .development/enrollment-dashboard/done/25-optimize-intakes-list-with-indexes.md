Title: Optimize Convex intakes.list using indexes for filters

Description
- Refactor `packages/backend/convex/functions/intakes.ts:list` to avoid `collect()` then in-memory filtering. Use `withIndex` queries and incremental narrowing where feasible (status, complexityBand, planYear) and stable sorting.

Acceptance Criteria
- `intakes.list` reduces reliance on `collect()` with full scan for common filters (status, complexityBand, planYear). Requestor substring may still require scan.
- Sorting is performed after filtered set is fetched; code is structured for clarity.
- No change to function args/return shape; unit tests (task 30) pass.

Implementation Notes
- File: `packages/backend/convex/functions/intakes.ts`
- Strategy implemented:
  - Use `withIndex` when a single value is provided for status/complexity/planYear.
  - For multi-value status/complexity, union results from multiple `withIndex` queries and dedupe by id.
  - Apply non-indexable filters (requestor substring, requestedProductionTime) in-memory.
  - Sort by `sortBy`/`order` with date handling for `dateReceived`.

Dependencies
- None (but complements dashboard task 24)

Estimated Effort
- 30–45 minutes

