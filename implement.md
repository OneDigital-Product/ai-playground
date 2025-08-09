# AI Playground – Minimal Viable Platform Plan

## Overview

This is a "keep it simple" implementation plan focused only on what is absolutely necessary to stand up a working platform that can run authenticated Astro pages, connect to a Convex backend, and render a minimal island-based app. Everything else (styling polish, advanced security/performance, developer tooling, debugging/seed scripts, etc.) is intentionally deferred until real product needs justify them.

Guiding principles:

- Start with the shortest path to a deployable, authenticated shell + one working island
- Add only what directly enables building features on top
- Prefer defaults and built-ins over custom configuration

## Phase 1: Project Setup (Tasks 1–6)

### Task 1: Initialize TypeScript

- Create `tsconfig.json` with strict mode
- Enable path aliases for `@/*` if useful
- Ensure TypeScript-only (no loose JS)

### Task 2: Install Core Dependencies

- Astro (site framework)
- React (islands) + @astrojs/react
- Convex (client + server)
- Convex Auth: @convex-dev/auth and @auth/core (password authentication)
- TypeScript and types
- neverthrow (typed result handling; used in example island)
- Zod (for client-side and server-side validation)

### Task 3: Configure Astro Basics

- Create `astro.config.mjs`
- Add React integration for islands
- Specify `output: 'server'` for dynamic routes
- Configure adapter (Vercel/Netlify/Node)
- Keep Vite config to defaults (no custom HMR or advanced build tweaks)

### Task 4: Minimal Project Structure

- `src/` with `components/`, `pages/`, `lib/`
- `src/components/islands/` (for React islands)
- `convex/` (backend)
- `public/` (assets)

### Task 5: Environment Configuration

- Add `.env.example` with required variables:
  - `PUBLIC_CONVEX_URL` (for client)
  - `CONVEX_DEPLOY_KEY` (for production)
  - `AUTH_RESEND_KEY` (optional, for password reset emails)
- `.env.local` in `.gitignore`

### Task 6: Development Scripts

- `dev`, `build`, `preview`
- Optional: `typecheck`
- Defer ESLint/Prettier until needed

## Phase 2: Convex Backend (Tasks 7–11)

### Task 7: Initialize Convex

- Run `npx convex dev` to bootstrap project
- Configure Convex code generation for type-safe API calls
- Set up `convex/_generated` exports
- Commit generated config/types

### Task 8: Convex Client Setup

- `src/lib/convex.ts` to export a configured `ConvexReactClient`
- Create `AuthProvider` wrapper for islands
- Export `useAuth` hook for session access

### Task 9: Minimal Schema

- Create `convex/schema.ts`
- If using Convex Auth, include `authTables` from `@convex-dev/auth/server`
- Add an `apps` table (id, slug, name, active, admins: string[], createdAt, updatedAt)
- Add `messages` table for ChatApp island (id, userId, content, createdAt)
- Consider adding user profiles table

### Task 10: Auth Configuration (Convex Auth)

- Create `convex/auth.ts` with Password provider
- Configure password authentication with email/password flow
- Add email validation with Zod (must be `@onedigital.com` domain)
- Add password requirements validation (min 8 chars, must include number, lowercase, uppercase)
- Optional: Configure password reset flow with Resend for email delivery
- After first user sign-up, mark `aharvey@onedigital.com` as initial admin in DB

### Task 11: Minimal Queries/Mutations

- `convex/apps.ts`: `listActiveApps`, `getApp`
- `convex/messages.ts`: `send`, `list` (for ChatApp)
- Keep logic thin; enforce auth where required
- Use Convex validators (`v` from `convex/values`) for args/returns
- Add Zod validation schemas that match Convex schemas for client-side

## Phase 3: Auth UI (Tasks 12–15)

### Task 12: Base Layout

- `src/layouts/Layout.astro` with bare HTML/meta and stylesheet include

### Task 13: Sign-In/Sign-Up Page

- `src/pages/auth/signin.astro` with email and password fields
- Toggle between sign-in and sign-up flows
- Client-side validation for `@onedigital.com` domain
- Client-side password strength validation
- Call Convex Auth signIn with "password" provider

### Task 14: Password Reset Page (Optional)

- `src/pages/auth/reset.astro` for password reset flow
- Two-step form: request reset code, then enter code + new password
- Integration with Resend for sending reset codes via email

### Task 15: Minimal Auth Guard & Session Management

- `src/lib/auth.ts` or `src/components/shared/AuthGuard.tsx`
- Session token storage (httpOnly cookies or localStorage)
- Session validation middleware for protected routes
- Token refresh logic
- If not authenticated, redirect to sign-in

## Phase 4: Shell & Routing (Tasks 16–18)

### Task 16: Minimal Navigation

- `src/components/shell/Navigation.astro`
- Show sign-in/out and current user status

### Task 17: Homepage

- `src/pages/index.astro` with a basic welcome
- If authenticated, show list of active apps from Convex

### Task 18: Dynamic App Route

- `src/pages/apps/[app].astro`
- Resolve app by slug, or show a simple 404

## Phase 5: Islands (Tasks 19–21)

### Task 19: Base Island Wrapper

- `src/components/islands/BaseIsland.tsx`
- Provide `ConvexProvider` and basic loading/error states

### Task 20: Example Island (Hello/Chat Minimal)

- `src/components/islands/ChatApp.tsx` (very simple: input + message list)
- Use `neverthrow` Result/ResultAsync for client flows (form submit, mutation errors)
- Connect to actual Convex mutations/queries (messages.send, messages.list)
- Persist chat messages in Convex database

### Task 21: Simple Island Registry

- A small map from app slug to island component
- Validate existence, nothing more

## Phase 6: Minimal Styling & Errors (Tasks 22–26)

### Task 22: Global Styles

- `src/styles/global.css` with reset + simple typography
- Defer responsive system and design tokens until needed

### Task 23: Basic Error Handling & Logging

- Add a simple React `ErrorBoundary` for islands
- Structured logging utility
- Differentiate dev/prod log levels
- Log to console in dev; defer monitoring tooling

### Task 24: Error Pages

- `src/pages/404.astro` - Not found page
- `src/pages/500.astro` - Server error page

### Task 25: Deployment Configuration

- Install and configure Vercel adapter: `npx astro add vercel`
- Update `astro.config.mjs` to use Vercel adapter for serverless deployment
- Configure build command and environment variables in Vercel dashboard
- Set up Convex production deployment
- Deploy using Vercel CLI or GitHub integration

### Task 26: CORS & Security Headers

- Configure Astro middleware for security headers
- Set CORS policy for Convex client
- Basic CSP headers for production

## Deferred (Out of Scope for MVP)

- Advanced styling/polish: responsive system, transitions, loading skeletons, advanced error pages
- Security/perf hardening: Advanced CSP, rate limiting, bundle splitting strategies, caching/CDN controls, performance monitoring
- Developer experience: documentation suites, code generators, seed/debug utilities, manual HMR tweaks (Astro/Vite provides HMR by default)

## Completion Checklist (MVP)

- TypeScript project with Astro + React islands
- Convex backend initialized with minimal schema and auth
- Type-safe API calls between frontend and backend
- Password authentication with email/password flow
- Sign-in and sign-up flow for `@onedigital.com` domain with session management
- Optional password reset functionality via email
- Minimal navigation, homepage, and dynamic app route
- One working island (ChatApp) with persisted data
- Simple global styles, error boundary, and error pages
- Basic security headers and CORS configuration
- Deployment configuration ready for production

Ready to start building real app features on top.
