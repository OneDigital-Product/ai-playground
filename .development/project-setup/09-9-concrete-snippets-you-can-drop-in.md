## 9) Concrete snippets you can drop in

### 9.1 `apps/host/middleware.ts` (optional header shaping)

```ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Example: forward a signed header to upstreams
  // res.headers.set('x-gateway', 'product-host@vercel');

  // Example: block upstream Set-Cookie from APIs
  // (serve APIs through a route handler if you need response header filtering)

  return res;
}
```

You can modify **request headers** before the rewrite occurs. ([Vercel][8])

### 9.2 AKS service (Node/Express) — Auth0 JWT check

```ts
import express from 'express';
import { auth } from 'express-oauth2-jwt-bearer';

const checkJwt = auth({
  issuerBaseURL: process.env.AUTH0_ISSUER,   // https://<tenant>.us.auth0.com/
  audience: process.env.AUTH0_AUDIENCE,      // API identifier
});

const app = express();
app.use('/api', checkJwt);
app.get('/api/hello', (_, res) => res.json({ ok: true }));
```

(Use similar middleware in any language/runtime.) ([GitHub][20])

---

