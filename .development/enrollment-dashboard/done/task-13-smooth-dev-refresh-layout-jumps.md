Title: Smooth dev refresh layout jumps (non-prod polish)

Description:
- Reduce perceived layout shifts during Fast Refresh in development by reserving component heights or using skeletons where content loads asynchronously.

Acceptance Criteria:
- On code save during dev, major layout blocks (home cards, intake form sections) do not jump/collapse noticeably.
- Approach is dev-safe (guards behind `process.env.NODE_ENV !== 'production'` if needed) and carries zero prod cost.

Estimated Effort/Complexity: XS–S

Dependencies:
- None.

Relevant Files/Components:
- `apps/enrollment-dashboard/src/app/page.tsx`
- `apps/enrollment-dashboard/src/components/intake-form.tsx`
