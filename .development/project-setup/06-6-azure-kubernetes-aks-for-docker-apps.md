## 6) Azure Kubernetes (AKS) for Docker apps

You’ll publish containerized apps (APIs, services, workers) to **AKS**, expose them via **NGINX Ingress**, secure with **cert‑manager**, and surface them under **paths** via the Vercel host’s external rewrites.

### 6.1 Cluster add‑ons and DNS/TLS

* Install or enable the **App Routing** add‑on to get a managed **NGINX Ingress**. ([Microsoft Learn][16])
* Install **cert‑manager** and issue TLS certs via Let’s Encrypt using **DNS‑01** with **Azure DNS**. ([cert-manager][17])
* Install **external‑dns** to automate DNS records in Azure DNS for your ingress hosts (use Workload Identity/MSI permissions). ([GitHub][18], [azureglobalblackbelts.com][19])

> You can keep your AKS ingress on an internal or external IP; for a simple setup, expose it publicly at `aks-product.onedigital.com` with TLS and let Vercel rewrite `/reporting/*` to that hostname.

### 6.2 Docker app manifests (example)

`docker-apps/reporting-api` → publish image to **Azure Container Registry (ACR)**. Deploy with Helm or plain YAML:

```yaml
# infra/aks/reporting/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: reporting
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /$1
spec:
  tls:
    - hosts: [ "aks-product.onedigital.com" ]
      secretName: reporting-tls
  rules:
    - host: aks-product.onedigital.com
      http:
        paths:
          - path: /reporting(?:/(.*))?
            pathType: Prefix
            backend:
              service:
                name: reporting-svc
                port:
                  number: 8080
```

With this, all `/reporting/*` traffic at the ingress host is routed to your service. Your **Vercel host** simply rewrites `/reporting/:path*` to `https://aks-product.onedigital.com/:path*`. ([Vercel][1])

### 6.3 Auth on AKS services

* Make services **stateless** and require **`Authorization: Bearer <token>`**.
* For Node/Express, use Auth0’s `express-oauth2-jwt-bearer` (or validate the JWKS yourself). For any platform, configure `issuer` and `audience` (Auth0). ([GitHub][20])
* Because requests flow through Vercel rewrites, the browser’s **Auth0 cookies** for `product.onedigital.com` will be forwarded automatically. Prefer **tokens in `Authorization`** to avoid leaking upstream `Set‑Cookie` headers back to the browser; if needed, strip/set headers in Vercel Middleware. ([Vercel][8])

### 6.4 (Optional) lock down AKS ingress

If you need to restrict access to only the Vercel‑fronted path, add application‑level checks (e.g., require a signed header set by host middleware) in addition to JWT validation, since static egress IPs are an enterprise feature and vary otherwise.

---

