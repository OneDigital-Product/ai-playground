Title: Add unit tests for CSV escaping and sorting

Description
- Add Convex unit tests to verify CSV escaping for quotes/commas/newlines and verify sorting by `dateReceived` (desc/asc) and by string fields is case-insensitive.

Acceptance Criteria
- New tests under `packages/backend/convex/utils/csv.test.ts` run locally and pass.
- Tests cover:
  - Escaping quotes by doubling them, wrapping fields containing `,` `"` or `\n`.
  - Sorting correctness for `dateReceived` (numeric compare) and strings (case-insensitive).
- No changes to production logic beyond those required to import helpers into tests.

Implementation Notes
- Files:
  - Added `packages/backend/convex/utils/csv.ts` exporting `escapeCsv` and `sortForExport`.
  - `exportCsv` now reuses these helpers.
  - Tests in `packages/backend/convex/utils/csv.test.ts` use node:test/assert.

Dependencies
- 27-move-csv-generation-to-convex.md

Estimated Effort
- 30–45 minutes

