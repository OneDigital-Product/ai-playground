Title: Reduce hero-to-Quick Start spacing on home

Description:
- Tighten vertical spacing so the Quick Start content feels connected to the primary cards and is visible without unnecessary scrolling on typical laptop viewports.

Acceptance Criteria:
- The gap between the card grid and the Quick Start card is reduced (e.g., `mt-8` → `mt-4` or equivalent), keeping visual rhythm consistent with other sections.
- No overlap or crowding at tablet/mobile breakpoints.

Estimated Effort/Complexity: XS

Dependencies:
- Task 10 (CTA emphasis) optional but complementary.

Relevant Files/Components:
- `apps/enrollment-dashboard/src/app/page.tsx`
