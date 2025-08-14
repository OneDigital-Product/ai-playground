# Implementation Review and Plan

This document captures the findings from the implementation audit and outlines a pragmatic plan tailored for a small, internal tool. It intentionally avoids introducing external email providers for auth flows.

## Summary of Current State

- Stack: Astro + Convex + Convex Auth (Password) + React Islands
- Key Pages: index, apps/[app], auth/signin, auth/reset
- Islands: AuthSignIn, AuthStatus, AppsList, AppResolver, ChatApp, AuthChangePassword, AuthPasswordReset (present but not required for non-email reset)
- Convex backend: schema, auth, apps, messages, comments
- Middleware: basic security headers and CSP with Convex origin allowed

## Decisions and Constraints

- No email provider for authentication flows (sign up, sign in, or password reset). All flows must work without sending emails.
- Internal-only usage with onedigital.com emails enforced at the backend.
- Keep the setup simple, minimize moving parts.

## Issues Found (Non-Email Context)

1. Password reset island (AuthPasswordReset) assumes an email OTP flow. For a non-email setup, use a direct change password form (AuthChangePassword) when a user is already authenticated, and omit OTP-based reset.
2. Schema used string types where Convex Id<"users"> types are more precise. This is optional but recommended for relational integrity if we enforce it consistently.
3. CORS/CSP should allow Convex origin and be reasonably strict.
4. Duplicate convex client modules (src/lib/convex.ts and src/lib/convex.tsx) cause confusion; favor a single module.
5. Repo hygiene: ignore .vercel/ outputs.

## Minimal, Non-Email Plan

- Authentication
  - Continue to use Password provider without any email provider configured for verify or reset.
  - Enforce onedigital.com domain via profile().
  - For resetting password, do NOT provide an OTP flow. Instead, provide:
    - A Change Password page for logged-in users (current password + new password) using a simple mutation that verifies the current password server-side (leveraging Convex Auth Password crypto.verifySecret, if exposed via library hooks) or the signIn("password", { flow: "signIn" }) followed by a change password action.
    - If an unauthenticated user forgets the password, reset must be handled operationally (admin reset) since no email is used.

- UI/UX
  - Keep auth/reset page wired to AuthChangePassword for authenticated users only.
  - Ensure AuthSignIn and AuthStatus islands provide clear affordances for signing in and accessing the change password page.

- Backend
  - Keep schema as-is or optionally migrate user-related fields to v.id("users"). If migrating, ensure all code and test data are updated.
  - Keep comments.author as string to avoid breaking the demo comment feature.

- Middleware & Security
  - Keep CSP with connect-src including the Convex origin.
  - Keep CORS restrictive to app + Convex origins.

- Repo Hygiene
  - Ignore .vercel/ and .vercel/output.

## Optional Enhancements (Future)

- Add server-side password strength validation via validatePasswordRequirements in Password config (still no email providers required).
- Add admin-only reset mutation that allows setting a temporary password for a user (no email sent), surfaced via an internal admin UI.
- Replace any hard-coded admin logic with a robust role assignment flow.

## Test Plan

- Typecheck and build must pass (astro check, tsc, astro build).
- Manual flows:
  - Sign in with onedigital.com email and password works.
  - Non-onedigital.com domain rejected.
  - Authenticated user can navigate to Change Password and update password.
  - Comments and chat send/list work as before.
  - No emails are sent anywhere.

## Status

- Auth remains non-email based (no providers wired to Password.reset or Password.verify).
- Reset page points to AuthChangePassword as a non-email flow.
- Security headers and ignores in place.

If you want me to proceed with implementing a non-email change password backend mutation and tightening server-side password validation (without email), I can do that next in a separate, reviewable commit.
