## 3) Auth (Auth0 Universal Login + Email OTP) and session sharing

### 3.1 Auth0 tenant & app setup

* Create a Regular Web App in Auth0 for `product.onedigital.com`.
* **Allowed Callback URLs**: `https://product.onedigital.com/api/auth/callback`, plus localhost for dev.
* **Passwordless with Universal Login (OTP)**:

  1. Enable **Passwordless Email** connection (OTP, not magic link).
  2. In “Authentication Profile”, choose **Identifier First**.
  3. Ensure your Next.js auth flow **passes `connection=email`** so Universal Login shows OTP. ([Auth0][9])

> **Magic link** requires **Classic Login** and is **not supported** by Universal Login. If you must have magic links, you can switch to Classic Login and configure `passwordlessMethod: 'link'`. Understand the same‑browser constraint (not great on iOS). ([Auth0][2])

### 3.2 Use Azure Communication Services (Email) for Auth0 emails

* In Auth0 → **Branding → Email Provider**, select **Azure Communication Services** and provide the SMTP details from your ACS resource (domain verified, sender authenticated). ([Auth0][3], [Microsoft Learn][10])

### 3.3 Next.js apps (client + server) auth libraries

* Use **`@auth0/nextjs-auth0`** in **every** Next.js app. All apps share the same cookie & secret because the site is one domain (`product.onedigital.com`). ([npm][11], [GitHub][12])

`apps/web/src/app/api/auth/[...auth0]/route.ts` (App Router) and equivalent in `apps/host` and `apps/admin` (or centralize all auth routes in `apps/host` and avoid exposing them from others).

Initialize login to **OTP** by passing `authorizationParams: { connection: 'email' }` where you call login; with App Router you can pass params via your `/api/auth/login?connection=email` route or programmatically via the SDK. ([Auth0][9])

---

