Title: Implement status route Convex call and update client to use it

Description
- Make `POST /enrollment-dashboard/api/intakes/[intakeId]/status` call Convex `intakes.updateStatus` and return `{ success: true }` on success.
- Update `StatusSelect` to call the route (via `fetch`) instead of directly mutating Convex to standardize error handling and logging.

Acceptance Criteria
- Posting `{ status: <enum> }` to the route updates Convex and returns `{ success: true }`.
- `StatusSelect` performs optimistic UI update, reverts on failure, and shows toast from route errors.
- No direct `useMutation(api.functions.intakes.updateStatus)` in `StatusSelect`.

Implementation Notes
- Files:
  - Route: `apps/enrollment-dashboard/src/app/api/intakes/[intakeId]/status/route.ts`
  - Client: `apps/enrollment-dashboard/src/components/status-select.tsx`
- Route example:
  ```ts
  const res = await convex.mutation(api.functions.intakes.updateStatus as FunctionReference<"mutation">, {
    intakeId,
    status: result.data.status,
  });
  return NextResponse.json({ success: true });
  ```
- Client example:
  ```ts
  const resp = await fetch(`/enrollment-dashboard/api/intakes/${intakeId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
  if (!resp.ok) throw new Error((await resp.json()).error || 'Failed');
  ```

Dependencies
- None

Estimated Effort
- 30–45 minutes

