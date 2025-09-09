# Implement Convex HTTP DELETE for Uploads

## Description
Add `DELETE /enrollment/uploads?id=...` in Convex to delete an upload by id, aligning with existing Convex upload/download APIs and retiring the Next delete route.

Implementation steps:
1. Open `packages/backend/convex/http.ts` and add a new route for `DELETE /enrollment/uploads`.
2. Parse `id` from the query string and validate.
3. Call existing Convex action/mutation (e.g., `api.functions.uploads.deleteUpload`).
4. Return `204 No Content` or `200` with a JSON body; include CORS as per Task 03.
5. Add an `OPTIONS` handler for preflight.

Example (Convex httpAction sketch):
```ts
http.route({
  path: "/enrollment/uploads",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders })),
});

http.route({
  path: "/enrollment/uploads",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ error: "id required" }), { status: 400, headers: corsHeaders });
    await ctx.runAction(api.functions.uploads.deleteUpload, { uploadId: id });
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});
```

## Prerequisites
- Task 03 (CORS) utility suggested.

## Deliverables
- New Convex DELETE endpoint implemented and documented inline.
- Preflight handling and CORS headers included.

## Acceptance Criteria
- Successful delete returns 204; missing/invalid id returns 4xx.
- Deletion observed in storage/DB consistent with legacy behavior.
- Lint and type-check pass.

