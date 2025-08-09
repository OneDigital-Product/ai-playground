import type { MiddlewareHandler } from "astro";

// Basic security headers and permissive CORS for Convex client requests if needed.
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

  // Basic CSP suitable for MVP; adjust as needed
  // Allow connections to Convex URL while keeping a conservative CSP baseline
  const convexUrl = import.meta.env.PUBLIC_CONVEX_URL || "";
  const connectSrc = [
    "'self'",
    "https:",
    "http:",
    convexUrl ? new URL(convexUrl).origin : null,
  ]
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

  // Minimal CORS (allow same-origin by default). If you host Convex separately, you can widen this.
  const origin = context.request.headers.get("Origin");
  if (origin) {
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

  // Handle CORS preflight quickly
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: response.headers });
  }

  return response;
};
