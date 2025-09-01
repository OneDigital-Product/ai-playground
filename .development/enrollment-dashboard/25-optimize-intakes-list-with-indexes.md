Title: Optimize Convex intakes.list using indexes for filters

Description
- Refactor `packages/backend/convex/functions/intakes.ts:list` to avoid `collect()` then in-memory filtering. Use `withIndex` queries and incremental narrowing where feasible (status, complexityBand, planYear, requestorName) and stable sorting.

Acceptance Criteria
- `intakes.list` reduces reliance on `collect()` with full scan for common filters (status, complexityBand, planYear). Requestor substring may still require scan.
- Sorting is performed after filtered set is fetched; code is structured for clarity.
- No change to function args/return shape; unit tests (task 30) pass.

Implementation Notes
- File: `packages/backend/convex/functions/intakes.ts`
- Suggested strategy:
  - Start with the most selective filter present and use `withIndex` to query that index.
  - Apply additional filters by narrowing the in-memory array (e.g., requestor substring).
  - Keep sorting logic as-is but add comments separating filter and sort phases.
- Pseudocode:
  ```ts
  let q = ctx.db.query("intakes");
  if (args.status?.length === 1) {
    // Single status filter can use index efficiently
    results = await ctx.db.query("intakes")
      .withIndex("by_status", x => x.eq("status", args.status[0]))
      .collect();
  } else {
    results = await q.collect();
  }
  // Apply remaining filters on results ...
  ```

Dependencies
- None (but complements 24-pass-dashboard-filters-to-convex.md)

Estimated Effort
- 30–45 minutes

