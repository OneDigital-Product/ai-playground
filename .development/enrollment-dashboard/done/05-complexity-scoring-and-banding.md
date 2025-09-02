Title: Complexity Scoring & Banding

Summary
- Compute a numeric complexity score and map it to a band for each intake. Used in dashboard chips, detail page, and CSV.
- Mirrors the Express app’s utils/complexity.js logic.

User Stories / Acceptance Criteria
- As an admin, when I create an intake, the system calculates its complexity score and band automatically.
- As an admin, when I modify section changed flags or guide type/comms add-ons, the complexity recomputes on save.
- Complexity bands: Minimal, Low, Medium, High.

Algorithm
- Start score at 0.
- +1 for each section marked changed (A–Q where sectionsChangedFlags[code] === true).
- Guide Type:
  - New Guide Build: +15
  - Update Existing Guide: +0
- Communications Add Ons:
  - OE Letter: +3
  - OE Presentation: +5
  - Both: +10
  - None/Other: +0
- Map score to band:
  - 0–3 => Minimal
  - 4–8 => Low
  - 9–15 => Medium
  - 16+ => High

Backend (Convex)
- Helper: complexity.compute(intakeLike) -> { score, band }
- Usage:
  - intakes:create: compute from payload before insert.
  - intakes:updateSectionFlags or any edit of guideType/commsAddOns: recompute and persist.

Frontend (Next.js)
- Display:
  - Dashboard row: chip with band and small caption "Score: X".
  - Detail page: band chip and score.

Testing
- Unit: cover boundary cases (3→Minimal, 4→Low, 8→Low, 9→Medium, 15→Medium, 16→High).
- Property: increasing number of changed sections never decreases band.
- Integration: creating an intake with C & D changes (2), guideType=New Guide Build (15) => score ≥ 17 => High.

