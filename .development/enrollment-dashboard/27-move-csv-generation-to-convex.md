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
    - Apply filters like the current version, then sort if `sortBy/order` provided.
    - Map to CSV rows server-side and join with `\n` including header.
  - `apps/enrollment-dashboard/src/app/api/dashboard.csv/route.ts`:
    - Replace client-side stringify + sort with a single query `fetchQuery(api.functions.intakes.exportCsv, { filters, sortBy, order })` and return the string.
- Ensure escaping helper on server wraps any field containing `,` `"` or `\n` in quotes and doubles inner quotes.

Dependencies
- None (but tests in task 29 depend on this change).

Estimated Effort
- 30–45 minutes

