# Add Tests for Intake Create/Status/Section Flows

## Description
Add end-to-end or integration tests for intake creation, status update, and section upsert per the chosen path (SDK or HTTP).

Implementation steps:
1. Select testing approach: Playwright E2E (preferred) or API-level integration tests.
2. For HTTP path: exercise Convex HTTP endpoints directly; for SDK: mock minimal UI interactions or call server actions.
3. Cover success and one representative error path per flow.
4. Ensure tests run in CI and locally with env configured.

Example (pseudo Playwright):
```ts
test("create intake and update status", async ({ page }) => {
  // navigate to page, fill form, submit, assert success toast
  // update status, assert persisted state
});
```

## Prerequisites
- Tasks 09–12 completed.

## Deliverables
- Tests/scripts verifying intake flows with clear assertions.

## Acceptance Criteria
- Tests pass locally and in CI.
- Failures are actionable with clear messaging.

