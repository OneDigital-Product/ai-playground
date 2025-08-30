## 8) Auth UX flows (what the user experiences)

1. User visits `product.onedigital.com/app` (served by `apps/web` via host rewrite).
2. “Sign in” triggers Auth0 Universal Login with **`connection=email`** → user receives **OTP via ACS** → enters code on Auth0 UL → redirects back to `/app`. ([Auth0][9])
3. `@auth0/nextjs-auth0` stores the **session cookie** for `product.onedigital.com`. Because all apps share the same domain (different paths), the session is valid across `/admin`, `/reporting`, etc. ([npm][11])
4. `ConvexProviderWithAuth0` mints a Convex token from the Auth0 session; all Convex queries/mutations run as the user. ([Convex Developer Hub][4])
5. Calls to AKS services under `/reporting/*` include the browser cookies; your frontend should include **Bearer tokens** in `Authorization` headers for the API, validated by the service. If you need to derive tokens on the server, use `getAccessToken()` from `@auth0/nextjs-auth0`. ([GitHub][12])

---

