# Add Smoke Tests for CSV, Download, and Delete Flows

## Description
Add minimal tests or scripted checks to validate CSV export, file download, and upload deletion via Convex endpoints.

Implementation steps:
1. Choose test modality: Playwright (preferred) or curl-based scripts run in CI.
2. Implement tests covering:
   - CSV export returns 200 and a non-empty CSV with expected headers.
   - Download endpoint redirects (3xx) to a signed URL that returns 200.
   - DELETE endpoint returns 204 and resource is gone on subsequent fetch.
3. Add environment wiring for Convex URL in test env.
4. Ensure tests run in CI and locally.

Example (curl snippet for docs/testing):
```bash
curl -I "$CONVEX_URL/enrollment/dashboard.csv"
curl -I "$CONVEX_URL/enrollment/uploads/download?id=UPLOAD_ID"
curl -X DELETE -i "$CONVEX_URL/enrollment/uploads?id=UPLOAD_ID"
```

## Prerequisites
- Tasks 01–05 completed (endpoints in use).

## Deliverables
- Playwright tests and/or scripts verifying the three flows.
- CI wiring to execute tests.

## Acceptance Criteria
- Tests pass locally and in CI.
- Failures produce actionable messages.

