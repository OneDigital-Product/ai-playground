Title: Move CSV generation to Convex exportCsv (return string)

Description
- Update `packages/backend/convex/functions/intakes.ts:exportCsv` to return a CSV string (including header row) instead of an array of objects. Accept filter args and optional `sortBy`/`order`. Simplify the Next.js route to proxy the string.

Acceptance Criteria
- Convex `exportCsv` returns a CSV string with columns that match the Express app: `Intake ID, Client Name, Plan Year, Requestor Name, Status, Complexity Band, Complexity Score, Guide Type, Communications Add-ons, Requested Production Time, Date Received, Payroll Storage URL, General Notes`.
- `apps/enrollment-dashboard/src/app/api/dashboard.csv/route.ts` fetches the string and returns it verbatim with `Content-Type: text/csv`.
- Manual spot check shows proper CSV escaping for quotes, commas, and newlines.

Implementation Notes
- Files:
  - `packages/backend/convex/functions/intakes.ts` (exportCsv):
    - Applies filters like the list function, sorts by `sortBy/order`, then maps to CSV rows server-side and joins with `\n` including header.
    - Uses an `escapeCsv` helper to wrap fields containing "," `"` or `\n` and doubles inner quotes.
  - `apps/enrollment-dashboard/src/app/api/dashboard.csv/route.ts`:
    - Replaced client-side stringify + sort with a single query `fetchQuery(api.functions.intakes.exportCsv, { filters, sortBy, order })` and returns the string.

Dependencies
- None (tests for escaping tracked in task 29)

Estimated Effort
- 30–45 minutes

