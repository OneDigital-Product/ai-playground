## Developer guidelines for Enrollment Dashboard migration

- Always start with the index
  - Read 01-index.md first to understand scope, sequencing, and cross-cutting conventions.
  - Confirm your feature’s position in the implementation order and review how it maps back to the original Express app.

- Follow the dependency chain
  - Each numbered requirement (02–12) lists Dependencies; complete those first.
  - Verify prerequisite features are implemented and available in your branch before starting your task.
  - If a dependency is in progress elsewhere, coordinate to avoid query/mutation/action contract drift or duplicated effort.

- Maintain consistency
  - Frontend: Next.js App Router under basePath /enrollment-dashboard; use @repo/ui primitives and shared Tailwind v4 theme. Prefer Server Components for data fetching + small Client Components for interactivity.
  - Backend: Implement Convex queries/mutations/actions exactly as described (naming, args, returns). Use convex/values for runtime validation.
  - Validation: Mirror the shared Zod schemas on the client; validate Convex function args with convex/values (e.g., v.string(), v.number(), v.id("table")). Keep error shapes consistent with the requirements ({ error, fieldErrors? }).
  - Auth: App-level authentication is out of scope in this phase. Do not add login/logout flows or session middleware.
  - IDs, enums, flags, and CSV columns: match the definitions in the requirements to ensure parity with the source app.

- Reference the original Express app when needed
  - Use temp/EnrollmentGuideDashboard to disambiguate business rules, field meanings, CSV formatting, status handling, and section definitions (A–Q).
  - Controllers, models, and views in that app are the source of truth if a requirement detail is unclear.

- Test thoroughly (right-sized for this migration)
  - Unit tests (Convex): Cover function input validation, core logic (e.g., filters, CSV escaping, complexity boundaries), and data shape contracts.
  - Integration/E2E (Next.js): Validate the main user flows end-to-end. Keep tests high-level, focusing on the happy path unless a requirement calls out critical edge cases (e.g., upload size/type limits, status changes affecting stats).
  - Re-run tests for any feature whose dependencies changed (e.g., when updating shared types or a Convex query used by multiple pages).

- Implementation hygiene
  - Keep Convex query/mutation/action contracts and types in sync across frontend and backend. If a contract must change, update the corresponding requirement doc and notify dependent feature owners.
  - Prefer small, composable components and shared utilities; avoid ad-hoc patterns that diverge from the requirements docs.
  - Cross-check your feature’s “Testing” section in its requirement doc and ensure the listed tests are implemented.
