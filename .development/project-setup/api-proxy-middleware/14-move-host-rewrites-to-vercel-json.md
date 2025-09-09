# Move Host Rewrites to vercel.json (Optional)

## Description
Migrate `apps/host` rewrites from `next.config.ts` into `vercel.json` for declarative routing and consistency with monorepo patterns.

Implementation steps:
1. Create `apps/host/vercel.json` with the shared ignore step and copy of rewrites.
2. Keep `transpilePackages` etc. in `next.config.ts`; remove rewrites there if duplicated.
3. Push to preview and validate routing behavior.

Example `apps/host/vercel.json`:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "ignoreCommand": "node ../../scripts/turbo-ignore.js",
  "rewrites": [
    { "source": "/app/:path*", "destination": "https://web.example.com/app/:path*" },
    { "source": "/admin/:path*", "destination": "https://admin.example.com/admin/:path*" },
    { "source": "/reporting/:path*", "destination": "https://reporting.example.com/:path*" }
  ]
}
```

## Prerequisites
- None (optional task).

## Deliverables
- `vercel.json` with rewrites equivalent to `next.config.ts` logic.

## Acceptance Criteria
- Routing behaves identically in preview.
- Unaffected apps show “⏭ Unaffected” in build logs.

