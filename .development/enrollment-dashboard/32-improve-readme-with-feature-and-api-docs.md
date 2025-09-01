Title: Expand app README with features and API docs

Description
- Rewrite `apps/enrollment-dashboard/README.md` from the create-next-app boilerplate to document features, routes, Convex integration, environment variables, and deployment patterns aligned with the repository guidelines.

Acceptance Criteria
- README includes:
  - Overview and basePath behavior.
  - Feature list (dashboard, intake create, detail, sections, status, uploads, CSV export, delete).
  - API routes summary with brief request/response examples and `{ error, fieldErrors? }` shape.
  - Convex function surface overview and how to run locally (`convex dev`).
  - Link to `.development/enrollment-dashboard` requirements.
- File renders clearly and is concise.

Implementation Notes
- File: `apps/enrollment-dashboard/README.md`
- Include per-app Vercel settings and `NEXT_PUBLIC_CONVEX_URL` notes per AGENTS.md.
- Keep examples short and actionable.

Dependencies
- None

Estimated Effort
- 30–45 minutes

