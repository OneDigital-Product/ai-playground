## 0) Key decisions & constraints (read this first)

* **Single subdomain, path‑based composition.** Attach `product.onedigital.com` to **one** Vercel “host” project and mount each app (and Kubernetes services) at **paths** via **rewrites / Multi‑Zones**. Vercel supports external rewrites and serving multiple projects under one domain; only one project owns the production domain. ([Vercel][1])

* **Auth0 Universal Login + Passwordless**:

  * **Magic links are not supported with Universal Login**; magic links require **Classic Login** (and come with UX caveats on iOS since the flow must complete in the same browser). If you want to stay on Universal Login, use **Email OTP** (passwordless code) instead. ([Auth0][2])
  * You **can** use **Azure Communication Services (Email)** as Auth0’s external SMTP provider to send those OTP emails. ([Auth0][3])

* **Convex + Auth0**: Use the official integration (`ConvexProviderWithAuth0`) so your Next apps get a Convex token minted from the Auth0 session; Convex validates it against Auth0’s JWKS. ([Convex Developer Hub][4])

---

