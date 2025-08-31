For each Next.js app (apps/web, apps/admin, apps/docs), set the Vercel Build Command to:

npx convex deploy --cmd 'pnpm build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL

Also configure environment variable CONVEX_DEPLOY_KEY in Vercel (Preview + Production) so Convex can deploy and inject the URL.

