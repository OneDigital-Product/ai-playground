## 2) Domain & routing (one host, many zones)

### 2.1 Attach the domain

* In Vercel, add `product.onedigital.com` to the **`apps/host`** project. A production domain can be attached to **one** project only. ([Vercel][5])

### 2.2 Child apps use `basePath`

* In `apps/web/next.config.js`:

```js
/** @type {import('next').NextConfig} */
module.exports = { basePath: '/app' };
```

* In `apps/admin/next.config.js`:

```js
module.exports = { basePath: '/admin' };
```

(Configure **basePath** so assets/links resolve under the mounted path.) ([Next.js][7])

### 2.3 Gateway rewrites in `apps/host`

* `apps/host/next.config.js` (external rewrites):

```js
const WEB_ORIGIN   = process.env.WEB_ORIGIN;   // e.g. https://web-xyz.vercel.app
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN; // e.g. https://admin-xyz.vercel.app
const REPORTING_ORIGIN = process.env.REPORTING_ORIGIN; // AKS ingress FQDN

module.exports = {
  async rewrites() {
    return [
      { source: '/app/:path*',   destination: `${WEB_ORIGIN}/app/:path*` },
      { source: '/admin/:path*', destination: `${ADMIN_ORIGIN}/admin/:path*` },
      // example: route API on AKS
      { source: '/reporting/:path*', destination: `${REPORTING_ORIGIN}/:path*` },
    ];
  },
};
```

Vercel’s **external rewrites** forward the request (cookies/headers included) to another origin **without changing the browser URL**—perfect for a “single domain, many apps” design. ([Vercel][1])

> Tip: If you need to **add/strip headers** (e.g., inject `Authorization` to upstream or strip `Set-Cookie` coming back), do it in **Middleware** in `apps/host`. ([Vercel][8])

---

