Title: Manager Dashboard — List, Filters, Sorting, CSV Export

Summary
- Implement a sortable, filterable dashboard of intakes with status chips, complexity chips, and CSV export.

User Stories / Acceptance Criteria
- As an admin, I can view a table of all intakes sorted by date_received desc by default.
- I can filter by: status (multi), complexity band (multi), requestor substring, plan year, requested production time (multi).
- I can sort by client_name, requestor_name, guide_type, communications_add_ons, complexity_band, date_received, requested_production_time, status.
- I can export the current filtered dataset to CSV with the same columns as the Express app.
- The stats header shows total, in-progress (STARTED + ROADBLOCK), completed (DELIVERED_TO_CONSULTANT), and recent 7 days. Stats update when statuses change.

Backend (Convex)
- Queries:
  - intakes:list(filters, sort, order) -> paginated results with parsed flags.
  - intakes:stats() -> { total, by_status: Record<Status, number>, by_complexity: Record<Band, number>, recent_count }
  - intakes:exportCsv(filters, sort, order) -> string CSV

Frontend (Next.js)
- Page: /dashboard — a Server Component calling Convex queries via server actions ("use server") or RSC helpers.
- Components: Filters bar (search, multi-selects), sortable column headers, status select inline.
- Realtime: Revalidate or refetch stats on status change; consider Convex queries with refresh tags or client fetch+SWR.

Route Handler
- GET /enrollment-dashboard/api/dashboard.csv?{filters} (route handler in app/**/route.ts)
  - 200 text/csv with headers.

Dependencies
- 08-status-update

Testing
- Unit: filter parsing, query builders, CSV escaper.
- Integration: stats correctness against seeded data; sorting toggles; CSV matches rows and column order.

