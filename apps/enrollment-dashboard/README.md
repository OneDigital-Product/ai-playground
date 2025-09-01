This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Vercel Routing & Base Path

- Base path: this app serves under `/enrollment-dashboard` via `next.config.ts -> basePath`.
- Root redirect: to make the preview and production URLs work at the domain root, we add a Next redirect from `/` → `/enrollment-dashboard` with `basePath: false`. This ensures the redirect applies at the domain root rather than being prefixed by the base path.
- Vercel build: `vercel.json` uses the same Convex deploy wrapper as other apps (`npx convex deploy --cmd 'pnpm build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`) so `NEXT_PUBLIC_CONVEX_URL` is injected during the Next build.

Reference: `apps/web` solves the same “mounted under a path” requirement using rewrites in `vercel.json` to serve the Astro app from `/app`. For Next apps, we stick with `basePath` and a root redirect.
