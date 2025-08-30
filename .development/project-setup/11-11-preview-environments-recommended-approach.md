## 11) Preview environments (recommended approach)

* Keep `product.onedigital.com` for **Production** only (owned by `apps/host`).
* For PRs, use Vercel **Preview** URLs: each app gets `*.vercel.app`. Set the host project’s preview env vars `WEB_ORIGIN`, `ADMIN_ORIGIN`, `REPORTING_ORIGIN` to the other projects’ preview URLs so the **host preview** mirrors production routing on a preview domain. (External rewrites fully support this.) ([Vercel][1])
* Use **Convex Preview Deployments** (Preview Deploy Key) so PRs test against isolated backends. ([Convex Developer Hub][21])

---

