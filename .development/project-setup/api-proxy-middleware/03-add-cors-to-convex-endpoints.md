# Add/Verify CORS Headers on Convex Endpoints (CSV + Download)

## Description
Ensure Convex HTTP endpoints used directly by the UI include appropriate CORS headers when accessed cross-origin, and handle OPTIONS preflight requests.

Implementation steps:
1. Open `packages/backend/convex/http.ts` and locate the routes:
   - `GET /enrollment/dashboard.csv`
   - `GET /enrollment/uploads/download`
2. Add a small CORS utility for headers (origin allow-list as needed). Apply to responses and handle `OPTIONS` preflight.
3. If multiple endpoints share CORS, consider a wrapper to avoid duplication.
4. Verify in preview that browser requests succeed without CORS errors.

Example (Convex httpAction sketch):
```ts
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.CORS_ALLOW_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

http.route({
  path: "/enrollment/uploads/download",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders })),
});

http.route({
  path: "/enrollment/uploads/download",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    // ...build redirect URL via ctx.runAction(...)
    const res = Response.redirect("https://signed-url", 302);
    Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }),
});
```

## Prerequisites
- None.

## Deliverables
- Updated Convex routes with CORS headers and OPTIONS handling.
- Configuration for allowed origins if needed (env var or constant).

## Acceptance Criteria
- Preflight (`OPTIONS`) returns expected headers.
- `GET` requests succeed from UI origin without CORS errors.
- Lint and type-check pass for the backend package.

