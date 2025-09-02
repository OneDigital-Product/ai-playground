Title: Improve hover/active feedback for dark buttons

Description:
- Strengthen state feedback for buttons on dark backgrounds (e.g., primary navy). Increase contrast and motion subtlety for hover/active states using tokens and transitions in the shared UI button component.

Acceptance Criteria:
- Visual delta between default and hover/active is clearly perceptible (measurable luminance delta or contrast change ≥ 1.2x).
- No adverse impact on buttons across apps using `@repo/ui`.
- Hover/active states remain accessible (contrast against background maintained ≥ 3:1 for UI components).

Estimated Effort/Complexity: S–M

Dependencies:
- None.

Relevant Files/Components:
- `packages/ui/src/components/ui/button.tsx` (or equivalent) and related styles
- Cross-check with `apps/enrollment-dashboard` primary CTAs
