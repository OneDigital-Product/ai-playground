# @product/host — Product Gateway

A lightweight Next.js (App Router) gateway that owns product.onedigital.com and proxies to child apps.

## What it does
- Redirects `/` to `/app`
- Rewrites:
  - `/app/*` → WEB_ORIGIN/app/*
  - `/admin/*` → ADMIN_ORIGIN/admin/*
  - `/reporting/*` → REPORTING_ORIGIN/*
- Minimal homepage and `/healthz` endpoint
- No basePath, no vercel.json builds

## Environment variables
Create `.env` with (preview/prod example values):

```
WEB_ORIGIN=https://web-<id>.vercel.app
ADMIN_ORIGIN=https://admin-<id>.vercel.app
REPORTING_ORIGIN=https://aks-product.onedigital.com
```

For local development, use localhost origins (no trailing slashes):

```
WEB_ORIGIN=http://localhost:3001
ADMIN_ORIGIN=http://localhost:3002
REPORTING_ORIGIN=http://localhost:4000
```

Tip: You can copy `apps/host/.env.local.example` to `.env.local` to keep local-only overrides out of git.

## Local development

Option A — run just the host gateway:

```
pnpm dev --filter @product/host
```

Option B — run the full local proxy setup (web:3001, admin:3002, host:3000):

```
pnpm run dev:proxy
```

Then visit host at http://localhost:3000 and test:
- `/app` → proxies to http://localhost:3001/app
- `/admin` → proxies to http://localhost:3002/admin
- `/reporting` → proxies to http://localhost:4000
- `/healthz`

## Vercel project settings
- Root Directory: `apps/host`
- Production Domain: `product.onedigital.com`
- Env vars (Prod & Preview):
  - `WEB_ORIGIN` → the `web` project URL
  - `ADMIN_ORIGIN` → the `admin` project URL
  - `REPORTING_ORIGIN` → AKS ingress URL
- Build Command: default `pnpm build`
- No `vercel.json` builds; use Next config + dashboard

## Notes
- Host contains no Auth0/Convex code; child apps own auth/data.
- Keep rewrites origin-driven so previews can target preview URLs.
