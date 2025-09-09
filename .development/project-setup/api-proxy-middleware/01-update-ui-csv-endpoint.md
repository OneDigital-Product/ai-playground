# Update UI to Use Convex CSV Endpoint

## Description
Replace any UI actions/links that call the Next.js route `GET /enrollment-dashboard/api/dashboard.csv` with the Convex HTTP endpoint `GET /enrollment/dashboard.csv`.

Implementation steps:
1. Search for references to the old Next route within `apps/enrollment-dashboard` (e.g., `/api/dashboard.csv`).
2. Replace with a call to the Convex endpoint `/enrollment/dashboard.csv`, passing filter params as query parameters.
3. Preserve current filename behavior via the `Content-Disposition` header.
4. Handle cross-origin requests as needed (coordinate with Task 03 if the UI and Convex origins differ).
5. Verify that CSV contents and filters match prior behavior.

Example (client-side trigger building URL with filters):
```ts
const url = new URL(`${process.env.NEXT_PUBLIC_CONVEX_URL}/enrollment/dashboard.csv`);
Object.entries(filters ?? {}).forEach(([k, v]) => { if (v != null && v !== "") url.searchParams.set(k, String(v)); });
window.open(url.toString(), "_self");
```

## Prerequisites
- None strictly required, but if cross-origin, complete Task 03 (CORS) first or in parallel.

## Deliverables
- UI code updated to call Convex `GET /enrollment/dashboard.csv`.
- Inline code comment or small README note indicating new endpoint and parameter mapping.

## Acceptance Criteria
- Clicking export initiates a CSV download with the correct filename and headers.
- Provided filters are applied; CSV content matches legacy route output.
- No browser CORS errors in preview environment.
- Monorepo lint and type-check pass.

## Notes
- Consider feature flagging (temporary) to switch between old and new endpoints during verification, then remove once validated.

