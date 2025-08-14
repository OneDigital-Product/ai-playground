import 'es-module-lexer';
import './chunks/astro-designed-error-pages_COOoUX0v.mjs';
import 'kleur/colors';
import './chunks/astro/server_C8XUooFx.mjs';
import 'clsx';
import 'cookie';
import { s as sequence } from './chunks/index_mC2d0bIC.mjs';

const onRequest$1 = async (context, next) => {
  const response = await next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=()"
  );
  const convexUrl = "http://localhost:5173/fake-convex";
  const connectSrc = ["'self'", new URL(convexUrl).origin ].filter(Boolean).join(" ");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      `connect-src ${connectSrc}`,
      "font-src 'self' data:"
    ].join("; ")
  );
  const origin = context.request.headers.get("Origin");
  const allowedOrigins = /* @__PURE__ */ new Set();
  if (origin) {
    try {
      const siteUrl = new URL(context.url.origin).origin;
      allowedOrigins.add(siteUrl);
    } catch {
    }
    {
      try {
        allowedOrigins.add(new URL(convexUrl).origin);
      } catch {
      }
    }
    if (origin && allowedOrigins.has(origin)) {
      response.headers.set("Vary", "Origin");
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
      );
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
    }
  }
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: response.headers });
  }
  return response;
};

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
