import type { MiddlewareHandler } from "astro";

// Security headers and restricted CORS
export const onRequest: MiddlewareHandler = async (context, next) => {
  const response = await next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=()",
  );

  // CSP: allow connections to Convex URL
  const convexUrl = import.meta.env.PUBLIC_CONVEX_URL || "";
  const connectSrc = ["'self'", convexUrl ? new URL(convexUrl).origin : null]
    .filter(Boolean)
    .join(" ");

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      `connect-src ${connectSrc}`,
      "font-src 'self' data:",
    ].join("; "),
  );

  // Restricted CORS: only allow the app and Convex origins
  const origin = context.request.headers.get("Origin");
  const allowedOrigins = new Set<string>();
  if (origin) {
    try {
      const siteUrl = new URL(context.url.origin).origin;
      allowedOrigins.add(siteUrl);
    } catch {}
    if (convexUrl) {
      try {
        allowedOrigins.add(new URL(convexUrl).origin);
      } catch {}
    }

    if (origin && allowedOrigins.has(origin)) {
      response.headers.set("Vary", "Origin");
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With",
      );
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      );
    }
  }

  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: response.headers });
  }

  return response;
};
