# Custom API Gateway, Proxy, and Middleware Audit

## 1) Executive Summary

We audited the monorepo for custom API gateway, proxy, and middleware code that could be replaced with Vercel’s native features or Convex HTTP Actions. We focused on: host gateway routing, Next.js API routes, Convex HTTP Actions (packages/backend/convex/http.ts), and middleware/auth implementations.

Key findings:
- apps/host: Minimal, appropriate use of Next rewrites for cross-app routing; no custom server or middleware.
- apps/enrollment-dashboard: Multiple Next API routes are thin proxies to Convex (CSV export, status updates, uploads), duplicating Convex HTTP Actions or backend functions.
- packages/backend/convex/http.ts: Convex HTTP endpoints exist for CSV export and file upload/download; these can replace duplicated Next routes.
- No production middleware/auth in active apps; only conceptual docs and a temp Express POC.

Outcome: Clear opportunities to consolidate endpoints in Convex, remove duplicate Next routes, and simplify the architecture while keeping host rewrites as-is.

---

## 2) Detailed Findings

### A) Custom proxy/gateway logic in apps/host

1. Cross-app proxying via Next rewrites
- File: apps/host/next.config.ts
```ts
async rewrites() {
  return [
    { source: '/app/:path*', destination: `${WEB_ORIGIN}/app/:path*` },
    { source: '/admin/:path*', destination: `${ADMIN_ORIGIN}/admin/:path*` },
    { source: '/reporting/:path*', destination: `${REPORTING_ORIGIN}/:path*` },
  ];
}
```
Assessment: Idiomatic Next config that compiles to Vercel routing. Appropriate and minimal.
Recommendation: Keep as-is; optionally move to vercel.json if you prefer declarative routing.

2. Health check route
- File: apps/host/src/app/healthz/route.ts
```ts
export async function GET() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
}
```
Assessment: Lightweight liveness check.
Recommendation: Keep.

### B) Next.js API routes that duplicate Convex functionality

1. CSV export proxy (duplicate)
- File: apps/enrollment-dashboard/src/app/api/dashboard.csv/route.ts
```ts
const csvContent = await fetchQuery(api.functions.intakes.exportCsv, {
  filters: Object.keys(filters).length > 0 ? filters : undefined,
});
return new NextResponse(csvContent, {
  headers: {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
  },
});
```
Assessment: Thin proxy to Convex that duplicates Convex HTTP Action below.
Recommendation: Remove and call Convex GET /enrollment/dashboard.csv directly.

2. Intake creation proxy
- File: apps/enrollment-dashboard/src/app/api/intakes/route.ts
```ts
const convex = new ConvexHttpClient(convexUrl);
const validation = validateIntakeCreate(body);
const createResult = await convex.mutation(
  api.functions.intakes.create as FunctionReference<'mutation'>,
  intakeArgs
);
```
Assessment: Validation performed both in Next and Convex. Business logic is in Convex.
Recommendation: Prefer direct Convex client calls from the app; or expose a Convex HTTP endpoint and delete the Next route.

3. File operations proxies (partial duplicate)
- Files: apps/enrollment-dashboard/src/app/api/uploads/[id]/download/route.ts; apps/enrollment-dashboard/src/app/api/uploads/[id]/route.ts
```ts
// download
const download = await convex.action(api.functions.uploads.getDownloadUrl, { uploadId: id });
return NextResponse.redirect(download.url);

// delete
const result = await convex.action(api.functions.uploads.deleteUpload, { uploadId: id as string });
```
Assessment: Download duplicates existing Convex HTTP; delete exists only in Next.
Recommendation: Use Convex download endpoint directly; add Convex HTTP DELETE for uploads and remove Next delete route.

4. Intake status and section update proxies
- Files: apps/enrollment-dashboard/src/app/api/intakes/[intakeId]/status/route.ts; apps/enrollment-dashboard/src/app/api/intakes/[intakeId]/sections/[code]/route.ts
```ts
await convex.mutation(api.functions.intakes.updateStatus as FunctionReference<'mutation'>, { intakeId, status });
await convex.mutation(api.functions.sections.upsert, { intakeId, sectionCode: code as 'A'|'B'|...|'Q', payload: { change_description } });
```
Assessment: Thin wrappers over Convex mutations.
Recommendation: Prefer calling Convex directly from client/server, or add Convex HTTP endpoints and remove Next routes.

### C) Convex HTTP actions vs Next.js API route comparisons

Existing Convex HTTP endpoints (packages/backend/convex/http.ts):
```ts
const http = httpRouter();

// CSV export (duplicates Next route)
http.route({
  path: '/enrollment/dashboard.csv',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const csv = await ctx.runQuery(api.functions.intakes.exportCsv, { filters: ... });
    return new Response(csv as string, { status: 200, headers });
  }),
});

// File upload
http.route({
  path: '/enrollment/uploads',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const blob = await request.blob();
    const result = await ctx.runAction(api.functions.uploads.uploadFile, { intakeId, kind, file: blob });
    return new Response(JSON.stringify({ file: result }), { status: 200 });
  }),
});

// File download (duplicates Next route)
http.route({
  path: '/enrollment/uploads/download',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const download = await ctx.runAction(api.functions.uploads.getDownloadUrl, { uploadId: id });
    return Response.redirect(download.url, 302);
  }),
});
```
Assessment: Convex already provides clean public endpoints for CSV export and file operations; these should be the canonical endpoints.

### D) Custom middleware and authentication analysis

- No production middleware.ts present (only conceptual docs under `.development`).
- No custom auth/session handling in active apps.
- Temp legacy Express app under `temp/EnrollmentGuideDashboard/` (not used in production).
Recommendation: For auth, leverage Convex Auth or Vercel Middleware with an auth provider; avoid rolling custom sessions.

---

## 3) Code Examples (from findings)

- apps/host rewrites (see A.1)
- apps/host healthz (see A.2)
- Enrollment Dashboard CSV proxy (see B.1)
- Enrollment Dashboard intake creation proxy (see B.2)
- Enrollment Dashboard uploads download/delete proxies (see B.3)
- Convex HTTP router examples (see C)

---

## 4) Specific Recommendations (with rationale)

1) Remove duplicated Next routes and use Convex HTTP endpoints for:
- CSV export and file downloads
- Rationale: Single source of truth, fewer moving parts, simpler CORS handling, less latency.

2) Add Convex HTTP DELETE for uploads and retire Next delete route:
- Rationale: Completes the Convex uploads API surface and removes Next duplication.

3) For intake creation/status/section updates:
- Preferred: Use Convex client directly from the app (server or client components as appropriate).
- Alternative: Add Convex HTTP endpoints to standardize on HTTP.
- Rationale: Eliminates an unnecessary middle layer and centralizes validation/business logic.

4) Keep apps/host rewrites as-is (optionally in vercel.json):
- Rationale: Minimal, effective, and leverages Vercel routing; no added complexity.

---

## 5) Migration Plan (Consolidation Map)

| Next.js Route | Replace With (Convex) | Action |
| --- | --- | --- |
| GET /enrollment-dashboard/api/dashboard.csv | GET /enrollment/dashboard.csv | Remove Next route |
| GET /enrollment-dashboard/api/uploads/[id]/download | GET /enrollment/uploads/download?id=... | Remove Next route |
| DELETE /enrollment-dashboard/api/uploads/[id] | DELETE /enrollment/uploads?id=... | Add Convex endpoint, remove Next route |
| POST /enrollment-dashboard/api/intakes | Convex client call OR POST /enrollment/intakes | Choose and migrate |
| POST /enrollment-dashboard/api/intakes/[intakeId]/status | Convex client call OR POST /enrollment/intakes/status | Choose and migrate |
| POST /enrollment-dashboard/api/intakes/[intakeId]/sections/[code] | Convex client call OR POST /enrollment/intakes/section | Choose and migrate |

---

## 6) Implementation Steps

Phase 1 — Remove duplicates:
- Update UI links to use Convex CSV and download endpoints
- Add CORS headers to Convex endpoints if cross-origin
- Delete Next routes for CSV and download
- Add Convex DELETE /enrollment/uploads?id=...; update UI and remove Next delete route

Phase 2 — Simplify intake operations:
- Decide on client SDK vs HTTP actions
- Update forms/UI to call Convex directly or new Convex HTTP endpoints
- Remove corresponding Next routes

Phase 3 — Optional:
- Consider moving host rewrites into vercel.json
- Add Edge Middleware only if you need header shaping/observability

---

## 7) Benefits

- Performance: Fewer proxy hops, reduced cold starts, potential for better caching
- Maintainability: Single backend surface, unified error handling, fewer env vars
- Developer Experience: End-to-end typing with Convex client, simpler tests, clearer architecture
- Operational: Easier CORS configuration, unified logging/monitoring in Convex, consistent auth patterns

---

## 8) Risk Mitigation

- Migrate incrementally; keep Next routes behind flags until Convex endpoints verified
- Thorough testing in preview; add feature flags to toggle endpoints
- Rollback plan: restore Next routes if issues arise

---

## 9) Conclusion

Consolidating on Convex HTTP Actions and direct Convex client calls removes duplicate Next.js API routes, simplifies the system, and leverages platform-native capabilities. Host rewrites remain minimal and effective. Implementing the migration plan should improve performance, maintainability, and developer experience with low risk.

