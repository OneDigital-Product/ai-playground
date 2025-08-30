## 4) Convex + Auth0 wiring (shared backend)

### 4.1 Convex server config

* `packages/backend/convex/auth.config.ts`:

```ts
export default {
  providers: [
    {
      domain: process.env.AUTH0_DOMAIN!,       // e.g. your-tenant.us.auth0.com
      applicationID: process.env.AUTH0_CLIENT_ID!,
    },
  ],
};
```

Deploy/sync with CLI (`npx convex dev` for dev; `npx convex deploy` in CI). ([Convex Developer Hub][4])

### 4.2 Frontend provider

Wrap each app with **Auth0Provider** and **ConvexProviderWithAuth0**:

```tsx
// apps/web/app/providers.tsx
"use client";
import { Auth0Provider } from '@auth0/auth0-react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithAuth0 } from 'convex/react-auth0';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : undefined,
        // Force passwordless email OTP on Universal Login
        connection: 'email',
      }}
      useRefreshTokens
      cacheLocation="localstorage"
    >
      <ConvexProviderWithAuth0 client={convex}>
        {children}
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  );
}
```

This ensures the browser fetches an Auth0 token → Convex validates it against Auth0 → your Convex functions get `ctx.auth.getUserIdentity()`. ([Convex Developer Hub][4])

---

