# ADR: Intakes API Surface (SDK vs HTTP)

- Status: Accepted
- Date: 2025-09-09

- Context: We are consolidating API proxy middleware and removing duplicate Next.js API routes in the enrollment-dashboard app. Intake flows currently proxy to Convex via Next routes for create, status update, and section upsert. We must choose between calling Convex directly with the Convex client SDK or introducing new Convex HTTP endpoints for these operations.

- Options Considered: SDK | HTTP

- Decision: Use the Convex client SDK directly from the enrollment-dashboard app for all intake operations (create, status update, section upsert).

- Rationale:
  - Type safety and DX: The SDK provides end-to-end type safety from `convex/_generated/api` with autocompletion and compile-time checks, minimizing drift between UI and backend contracts. It aligns with existing usage of `useQuery` in the app and reduces boilerplate compared to hand-crafted HTTP handlers and schemas.
  - Auth and identity: The SDK integrates with Convex’s auth and session model without custom header/CORS handling. This simplifies secure calls from client components and server actions.
  - CORS and infra: Avoids adding new public HTTP endpoints and associated CORS configuration and preflight handling. Fewer moving parts reduce operational risk.
  - Consistency: The enrollment-dashboard already uses `ConvexProvider` and `useQuery`; adopting `useMutation` keeps a single integration style for data reads and writes.
  - Performance and caching: These operations are highly dynamic (mutations) and not cacheable via CDN. HTTP endpoints offer limited benefit here compared to SDK calls.

- Consequences:
  - Implementation: UI components will call Convex mutations directly via `useMutation` or a `ConvexHttpClient` when needed. We will remove the Next.js API routes for these operations.
  - Error handling: Client-side validation (Zod) remains in the UI; authoritative validation continues in Convex functions. We preserve actionable error messaging surfaced to the UI.
  - Testing: We will add a smoke script that exercises the Convex mutations and queries via `ConvexHttpClient` to verify create → status update → section upsert flows end-to-end.
  - Future HTTP needs: We retain Convex HTTP routes where they make sense (e.g., file upload/download redirects, CSV export). Intake mutations remain SDK-only to maximize type safety and minimize CORS complexity.

- Rollback Plan:
  - If SDK integration poses issues, we can add parallel Convex HTTP endpoints:
    - `POST /enrollment/intakes` → `intakes.create`
    - `POST /enrollment/intakes/status` → `intakes.updateStatus`
    - `POST /enrollment/intakes/section` → `sections.upsert`
  - The UI would switch fetch targets accordingly without changing backend logic.

