## 14) Step‑by‑step checklist

1. **Auth0**

   * Create tenant + Regular Web App.
   * Enable **Passwordless Email**; set Universal Login **Identifier‑First**; ensure login passes `connection=email` (OTP). ([Auth0][9])
   * Configure **Email Provider = Azure Communication Services** (SMTP). Verify domain & sender. ([Auth0][3])

2. **Convex**

   * Add `auth.config.ts` with Auth0 domain/client.
   * Set Convex env vars and deploy; in Vercel builds, run `npx convex deploy --cmd 'pnpm build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`. ([Convex Developer Hub][13])

3. **Next.js**

   * Each app uses `@auth0/nextjs-auth0` + `convex/react-auth0`. ([npm][11], [Convex Developer Hub][4])
   * Set `basePath` per app; wire `providers.tsx` as above. ([Next.js][7])

4. **Vercel host (`apps/host`)**

   * Attach `product.onedigital.com`.
   * Add **external rewrites** for `/app`, `/admin`, `/reporting` (AKS). ([Vercel][1])
   * (Optional) Middleware for header shaping.

5. **AKS**

   * Enable **App Routing** (NGINX Ingress). ([Microsoft Learn][16])
   * Install **cert‑manager** (DNS‑01 via Azure DNS). ([cert-manager][17])
   * Install **external‑dns** (Workload Identity) to manage Azure DNS records. ([GitHub][18])
   * Deploy your Docker apps; expose via **Ingress**; point Vercel rewrites to ingress host.

6. **Preview**

   * Use Vercel Preview domains for all apps; set host preview env to the other projects’ preview URLs; enable **Convex Preview Deployments**. ([Convex Developer Hub][21])

---

### That’s the whole system

* **Routing**: One subdomain, path‑composed via Vercel rewrites/Multi‑Zones. ([Vercel][5])
* **Auth**: Auth0 Universal Login + OTP (ACS SMTP). Sessions shared across all paths. ([Auth0][9])
* **Convex**: Official Auth0 integration and Vercel build step inject the URL. ([Convex Developer Hub][4])
* **Docker/K8s**: AKS with NGINX Ingress + cert‑manager + external‑dns; surfaced under the same domain via rewrites. ([Microsoft Learn][16], [cert-manager][17], [GitHub][18])

If you want, I can turn this into a ready‑to‑clone starter (host rewrites, basePaths, Convex auth config, a sample AKS ingress, and a GitHub Action to build to ACR and deploy).

[1]: https://vercel.com/docs/rewrites?utm_source=chatgpt.com "Rewrites on Vercel"
[2]: https://auth0.com/docs/authenticate/passwordless/authentication-methods/email-magic-link "Passwordless Authentication with Magic Links"
[3]: https://auth0.com/docs/customize/email/smtp-email-providers/configure-azure-comm-service-as-smtp-email-provider?utm_source=chatgpt.com "Configure Azure Communication Services as External SMTP Email Provider"
[4]: https://docs.convex.dev/auth/auth0 "Convex & Auth0 | Convex Developer Hub"
[5]: https://vercel.com/guides/how-can-i-serve-multiple-projects-under-a-single-domain?utm_source=chatgpt.com "How can I serve multiple projects under a single domain? - Vercel"
[6]: https://nextjs.org/docs/pages/guides/multi-zones?utm_source=chatgpt.com "Guides: Multi-Zones | Next.js"
[7]: https://nextjs.org/docs/pages/api-reference/config/next-config-js/basePath?utm_source=chatgpt.com "next.config.js Options: basePath | Next.js"
[8]: https://vercel.com/guides/modify-request-headers?utm_source=chatgpt.com "Modifying request headers - Vercel"
[9]: https://auth0.com/docs/authenticate/passwordless/passwordless-with-universal-login "Passwordless with Universal Login"
[10]: https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/create-email-communication-resource?pivots=platform-azp&utm_source=chatgpt.com "Create and manage Email Communication Service resource in Azure ..."
[11]: https://www.npmjs.com/package/%40auth0/nextjs-auth0?utm_source=chatgpt.com "@auth0/nextjs-auth0 - npm"
[12]: https://github.com/auth0/nextjs-auth0/blob/main/EXAMPLES.md?utm_source=chatgpt.com "nextjs-auth0/EXAMPLES.md at main - GitHub"
[13]: https://docs.convex.dev/production/hosting/vercel?utm_source=chatgpt.com "Using Convex with Vercel | Convex Developer Hub"
[14]: https://vercel.com/docs/monorepos/turborepo?utm_source=chatgpt.com "Deploying Turborepo to Vercel"
[15]: https://turborepo.com/docs/core-concepts/remote-caching?utm_source=chatgpt.com "Remote Caching - Turborepo"
[16]: https://learn.microsoft.com/en-us/azure/aks/app-routing?utm_source=chatgpt.com "Azure Kubernetes Service (AKS) managed NGINX ingress with the ..."
[17]: https://cert-manager.io/docs/tutorials/getting-started-aks-letsencrypt/?utm_source=chatgpt.com "Deploy cert-manager on Azure Kubernetes Service (AKS) and use Let's ..."
[18]: https://github.com/kubernetes-sigs/external-dns/blob/master/docs/tutorials/azure.md?utm_source=chatgpt.com "external-dns/docs/tutorials/azure.md at master - GitHub"
[19]: https://azureglobalblackbelts.com/2023/12/18/external-dns-workload-identity.html?utm_source=chatgpt.com "Using External DNS in AKS with Azure Workload Identity"
[20]: https://github.com/auth0/nextjs-auth0?utm_source=chatgpt.com "auth0/nextjs-auth0: Next.js SDK for signing in with Auth0 - GitHub"
[21]: https://docs.convex.dev/production/hosting/preview-deployments?utm_source=chatgpt.com "Preview Deployments | Convex Developer Hub"
