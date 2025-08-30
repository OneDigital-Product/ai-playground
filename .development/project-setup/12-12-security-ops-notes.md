## 12) Security & ops notes

* **Cookies vs tokens:** For APIs (especially those proxied to AKS), prefer **Bearer tokens**; keep cookies for the Next.js session only. Use Middleware to inject/strip headers as required. ([Vercel][8])
* **TLS and DNS automation on AKS:** use **cert‑manager** + **external‑dns** with Azure DNS (and Workload Identity) so hostnames and cert renewals are zero‑touch. ([cert-manager][17], [GitHub][18])
* **Ingress flavor:** Azure’s **App Routing add‑on** gives you a supported NGINX Ingress without running your own chart. ([Microsoft Learn][16])

---

