Title: Admin Dashboard Access (No Authentication)

Summary
- During the migration phase, treat the enrollment dashboard as an internal admin tool with no login.
- Authentication/authorization is handled at the monorepo/gateway level and is out of scope. All dashboard routes are accessible without app-level session gates.

User Stories / Acceptance Criteria
- As an admin, I can navigate to /enrollment-dashboard and access dashboard, intakes, and uploads without logging in.
- There is no login/logout flow; pages load directly with no redirects to /login.

Backend (Convex)
- No authentication-related tables or functions are required.

Frontend (Next.js)
- No authentication middleware or session handling.
- No /login or /logout routes or UI needed.
- Use @repo/ui and Tailwind v4 as usual for page layouts.

API Contract
- None.

Dependencies
- None

Testing
- Verify routes load without redirects or session cookies.
- Confirm unauthenticated access to dashboard and intake pages works in dev and preview.

