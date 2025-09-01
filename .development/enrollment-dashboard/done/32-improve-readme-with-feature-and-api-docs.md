Title: Expand app README with features and API docs

Description
- Rewrite `apps/enrollment-dashboard/README.md` from boilerplate to document features, API routes, Convex integration, environment variables, and deployment configuration.

Acceptance Criteria
- README includes:
  - Overview and basePath behavior.
  - Feature list (dashboard, create, detail, sections, status, uploads, CSV export, delete).
  - API routes summary with request/response shape and `{ error, fieldErrors? }` errors.
  - Convex function overview and local dev instructions.
  - Link to `.development/enrollment-dashboard` requirements.

Implementation Notes
- File updated: `apps/enrollment-dashboard/README.md` with concise, scannable sections.
- Includes Vercel build wrapper (`npx convex deploy --cmd 'pnpm build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`).

Dependencies
- None

Estimated Effort
- 30–45 minutes

