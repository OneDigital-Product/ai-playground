Title: Add unit tests for CSV escaping and sorting

Description
- Add Convex unit tests to verify CSV escaping for quotes/commas/newlines and verify sorting by `dateReceived` (desc/asc) and by string fields is case-insensitive.

Acceptance Criteria
- New tests under `packages/backend/convex/utils` or `functions` run locally and pass.
- Tests cover:
  - Escaping quotes by doubling them, wrapping fields containing `,` `"` or `\n`.
  - Sorting correctness for `dateReceived` (numeric compare) and strings (case-insensitive).
- No changes to production logic beyond those required to import helpers into tests if needed.

Implementation Notes
- Files:
  - Add `packages/backend/convex/utils/csv.test.ts` (or near `intakes.ts` if you prefer co-location).
- Suggested strategy:
  - Extract a small `escapeCsvField` helper into `packages/backend/convex/utils/csv.ts` if not yet present, and import from `exportCsv` implementation.
  - Seed sample inputs representing tricky fields and assert the resulting CSV string.

Dependencies
- 27-move-csv-generation-to-convex.md

Estimated Effort
- 30–45 minutes

