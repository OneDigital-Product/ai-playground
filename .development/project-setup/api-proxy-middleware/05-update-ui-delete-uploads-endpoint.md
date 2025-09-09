# Update UI to Call Convex DELETE Uploads

## Description
Switch UI delete operations from Next `DELETE /enrollment-dashboard/api/uploads/[id]` to Convex `DELETE /enrollment/uploads?id=...`.

Implementation steps:
1. Search for delete upload calls in `apps/enrollment-dashboard`.
2. Replace with a fetch to Convex DELETE endpoint; include error handling and user feedback.
3. Update types and utilities as needed.
4. Coordinate with Task 04 completion (endpoint available) and Task 03 (CORS) if cross-origin.

Example (client-side fetch):
```ts
const url = `${process.env.NEXT_PUBLIC_CONVEX_URL}/enrollment/uploads?id=${encodeURIComponent(uploadId)}`;
const res = await fetch(url, { method: "DELETE", credentials: "include" });
if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
```

## Prerequisites
- Task 04 (Convex DELETE endpoint) completed.
- Task 03 if cross-origin.

## Deliverables
- UI updated to call Convex DELETE endpoint with proper error handling.

## Acceptance Criteria
- Deleting an upload works as before (success and error states handled in UI).
- No CORS errors.
- Monorepo lint and type-check pass.

