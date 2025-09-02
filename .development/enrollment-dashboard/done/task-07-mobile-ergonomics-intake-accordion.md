Title: Improve mobile ergonomics of intake form with collapsible sections

Description:
- Reduce cognitive load on small screens by grouping the per‑section configuration into an accordion.
- Provide an in‑page index (sticky or top) to jump to sections A–Q.

Acceptance Criteria:
- On viewports ≤ 768px, sections render collapsed by default with concise summaries (e.g., Included: Yes/No, Changes: Yes/No).
- Tapping a section header expands only that section; only one section open at a time (optional setting).
- In‑page index enables quick jump to a section and reflects which section is open.
- No horizontal scrolling introduced; form remains fully keyboard accessible.

Estimated Effort/Complexity: M

Dependencies:
- None.

Relevant Files/Components:
- `apps/enrollment-dashboard/src/components/intake-form.tsx` (extract section block into accordion items)
- `@repo/ui/components/ui/accordion` (if available) or add via shadcn generation to shared `@repo/ui`
