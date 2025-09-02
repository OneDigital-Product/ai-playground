Enrollment Dashboard — Architecture Notes (Hybrid Convex + Next.js)

Overview
- This app uses Convex for backend data, business logic, and storage, and Next.js (App Router) for UI and domain concerns.
- Favor Convex functions (queries, mutations, actions) for application logic; use Next.js only where Next-specific features add value.

When to use Convex
- Data access & business logic: intakes, sections, status updates, stats, CSV generation.
- File storage: upload, list, delete, and signed URLs via `ctx.storage`.
- Webhooks & public HTTP endpoints: use Convex HTTP Actions with `httpRouter`.
- Server rendering fetch: call Convex from Server Components/Actions via `fetchQuery`/`fetchMutation`/`fetchAction` (convex/nextjs).

When to use Next.js API routes
- Thin proxies for domain-specific headers (e.g., `Content-Disposition`, custom Cache-Control) if not using Convex HTTP Actions.
- Integrations with Next-only features (cookies, revalidatePath, middleware) combined with Convex calls.
- BasePath routing under `/enrollment-dashboard` when keeping URLs consistent for the app surface.

Current Hybrid Choices
- CSV export: Generated on Convex (`intakes.exportCsv`). Next route `/api/dashboard.csv` is a thin proxy returning `text/csv` + filename.
- Status update: Next route calls Convex mutation; can be replaced with direct Convex call from client if desired.
- Uploads: Handled by Next routes today; consider migrating to Convex HTTP Actions for CORS-friendly public endpoints.

Recommended Patterns
- UI (client): `useQuery` / `useMutation` for live data where appropriate.
- UI (server): SSR with `preloadQuery`/`fetchQuery`; pass token if using auth.
- Webhooks/public API: Define `convex/http.ts` with `httpRouter()` and `httpAction()`.
- Keep API surface consistent: error shape `{ error, fieldErrors? }` in routes.

Migration Notes
- Where Next routes are only proxies (no Next-specific behavior), prefer Convex HTTP Actions or direct Convex calls and remove routes.
- File uploads/downloads are good candidates to move to Convex HTTP Actions (serve/upload with proper CORS and content-type).

