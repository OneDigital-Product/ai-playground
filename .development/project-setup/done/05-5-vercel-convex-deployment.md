## 5) Vercel ↔ Convex deployment

In each **Next.js app** project on Vercel, set build command to **deploy Convex first**, then build. Convex injects the deployed URL into an env var your app reads (e.g., `NEXT_PUBLIC_CONVEX_URL`):

```
npx convex deploy --cmd 'pnpm build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL
```

Convex’s docs recommend overriding the Vercel build command this way; it reads `CONVEX_DEPLOY_KEY` and sets the URL for your build. Use a **Preview Deploy Key** on preview envs so every PR gets a fresh backend. ([Convex Developer Hub][13])

Turborepo + Vercel Remote Cache are supported out‑of‑the‑box for faster builds. ([Vercel][14], [Turborepo][15])

---

