# Update UI to Use Convex File Download Endpoint

## Description
Replace Next.js `GET /enrollment-dashboard/api/uploads/[id]/download` with the Convex HTTP endpoint `GET /enrollment/uploads/download?id=...` in the UI.

Implementation steps:
1. Search for references to the old download API path in `apps/enrollment-dashboard`.
2. Replace with a call/redirect to `${CONVEX_URL}/enrollment/uploads/download?id=<uploadId>`.
3. Ensure redirect behavior is handled (Convex endpoint may return a redirect to a signed URL).
4. Coordinate with Task 03 (CORS) if origins differ.
5. Validate that downloading works for existing uploads.

Example (client-side):
```ts
const url = `${process.env.NEXT_PUBLIC_CONVEX_URL}/enrollment/uploads/download?id=${encodeURIComponent(uploadId)}`;
window.location.href = url;
```

## Prerequisites
- None strictly; CORS (Task 03) may be required if cross-origin.

## Deliverables
- UI code updated to call the Convex download endpoint.
- Any associated utility helpers updated and typed.

## Acceptance Criteria
- Download succeeds for various file types and sizes.
- Redirects resolve correctly to the final signed URL.
- No CORS errors in the browser.
- Monorepo lint and type-check pass.

