Title: Clarify primary CTA hierarchy on home

Description:
- Make the first‑time path more prominent on the home page. Options include:
  - Reordering cards to place “Intake Management” first and/or highlighting “Create First Intake”.
  - Emphasizing the primary CTA with a distinct style or short helper text near the hero.

Acceptance Criteria:
- Home at `/enrollment-dashboard` clearly presents a single primary action (“Create First Intake” or “Manage Intakes”).
- Quick Start area appears visually connected to the hero/cards (reduced gap; see Task 12 for spacing specifics) and is visible without excessive scrolling on laptop screens.
- No navigation regressions.

Estimated Effort/Complexity: S

Dependencies:
- None.

Relevant Files/Components:
- `apps/enrollment-dashboard/src/app/page.tsx`
