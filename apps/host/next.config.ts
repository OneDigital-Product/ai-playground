/** @type {import('next').NextConfig} */
// Provide safe defaults so local builds don't fail when env vars aren't set
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? 'http://127.0.0.1';
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN ?? 'http://127.0.0.1';
const REPORTING_ORIGIN = process.env.REPORTING_ORIGIN ?? 'http://127.0.0.1';

const nextConfig = {
  async redirects() {
    // Redirect root to /app in production only; show homepage in dev for smoke tests
    return process.env.NODE_ENV === 'production'
      ? [{ source: '/', destination: '/app', permanent: false }]
      : [];
  },
  async rewrites() {
    return [
      { source: '/app/:path*', destination: `${WEB_ORIGIN}/app/:path*` },
      { source: '/admin/:path*', destination: `${ADMIN_ORIGIN}/admin/:path*` },
      { source: '/reporting/:path*', destination: `${REPORTING_ORIGIN}/:path*` },
    ];
  },
};

export default nextConfig;
