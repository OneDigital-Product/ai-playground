## 1) Monorepo layout (Turborepo)

```
repo/
  apps/
    host/            # Next.js "gateway" that owns product.onedigital.com
    web/             # Next.js app  ➜ product.onedigital.com/app
    admin/           # Next.js app  ➜ product.onedigital.com/admin
  packages/
    backend/
      convex/        # Convex backend (schema, functions, auth.config.ts)
    ui/              # Shared UI components
    config/          # shared ESLint/TS/tailwind config, env schema
  docker-apps/
    reporting-api/   # Example Docker app to run on AKS
  infra/
    aks/             # Helm charts / K8s manifests for AKS
  turbo.json
  pnpm-workspace.yaml
```

* Each Next.js app is its **own Vercel project**. `apps/host` owns `product.onedigital.com`; it rewrites subpaths to the other Vercel projects and to AKS. (This is the canonical Multi‑Zones + rewrites approach.) ([Vercel][5], [Next.js][6])

---

