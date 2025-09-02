Title: Extract reusable SectionConfig component for intake sections

Description:
- Encapsulate the repeated “Include in Guide” and “Changes Beyond Annual Updates” radio groups into a reusable `SectionConfig` component to reduce duplication and improve consistency.

Acceptance Criteria:
- New `SectionConfig` component renders the two radio groups and optional description textarea.
- `IntakeForm` uses the component for all sections A–Q via a loop; props handle value/state updates.
- No visual or behavioral regressions; unit snapshot or Storybook check acceptable.

Estimated Effort/Complexity: S–M

Dependencies:
- None (can be done independently of accordion work).

Relevant Files/Components:
- `apps/enrollment-dashboard/src/components/intake-form.tsx` (refactor usage)
- New file: `apps/enrollment-dashboard/src/components/section-config.tsx` (or similar)
