## 10) Environment map (who owns what)

| Variable                                                  | Where                  | Purpose                                                                                                  |
| --------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `CONVEX_DEPLOY_KEY`                                       | Vercel (each Next app) | Lets `npx convex deploy` run in builds and inject `NEXT_PUBLIC_CONVEX_URL`. ([Convex Developer Hub][13]) |
| `NEXT_PUBLIC_CONVEX_URL`                                  | Vercel (injected)      | Convex client URL in the browser. ([Convex Developer Hub][13])                                           |
| `NEXT_PUBLIC_AUTH0_DOMAIN`, `NEXT_PUBLIC_AUTH0_CLIENT_ID` | Vercel (all apps)      | Auth0 domain & SPA client id for the browser; same across apps. ([npm][11])                              |
| `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL` | Vercel (all apps)      | Server‑side session encryption & callback base URL. ([npm][11])                                          |
| `WEB_ORIGIN`, `ADMIN_ORIGIN`, `REPORTING_ORIGIN`          | Vercel (host only)     | External rewrite targets for child apps & AKS. ([Vercel][1])                                             |
| `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`                         | Convex env             | Convex auth config for JWT validation. ([Convex Developer Hub][4])                                       |
| `AUTH0_ISSUER`, `AUTH0_AUDIENCE`                          | AKS (per service)      | JWT validation for APIs. ([GitHub][20])                                                                  |

---

