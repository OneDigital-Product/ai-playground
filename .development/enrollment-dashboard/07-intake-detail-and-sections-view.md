Title: Intake Detail — Overview & Sections View

Summary
- Implement the intake detail page with two tabs: Overview and Sections. Mirrors Express /intakes/:id.

User Stories / Acceptance Criteria
- As an admin, I can view an intake’s basic info, flags, complexity score/band, pages required, and timestamps.
- I can switch between Overview and Sections tabs via URL param (?tab=overview|sections).
- Sections tab shows only sections that have data; each shows the section name and a change_description.
- If just created, a success alert renders on first load (e.g., ?created=1).

Backend (Convex)
- Queries:
  - intakes:get({ intakeId }) -> intake entity with parsed flags
  - sections:getByIntake({ intakeId }) -> array of { sectionCode, payload }
  - uploads:listByIntake({ intakeId }) (optional display in overview)

Frontend (Next.js)
- Route: /enrollment-dashboard/intakes/[intakeId]?tab=overview|sections.
- A Server Component fetches Convex data; renders tabs and content.
- Components:
  - OverviewCard: client/requestor/year, dateReceived, guideType, comms add-ons, status select (see 08-status-update), complexity chip, pages required chips, payroll_storage_url, requested_production_time, notes
  - SectionsList: iterate over sectionDefinitions A–Q, render present ones with change_description
- Use shared section definitions mapping letters to names:
  - A: Eligibility
  - B: Enrollment
  - C: Benefits Administration
  - D: Medical- Plans and Plan Designs
  - E: Medical- Deductible Support (EX:HRA/HSA)
  - F: Medical- Spending Accounts (EX:FSA/LPFSA/DCA)
  - G: Medical- Telehealth
  - H: Dental
  - I: Vision
  - J: Life/AD&D
  - K: Voluntary Life/AD&D
  - L: Short Term Disability
  - M: Long Term Disability
  - N: Statutory Leave
  - O: Voluntary Benefits (EX:Accident/CI/HI)
  - P: EAP
  - Q: Additional Perks and Other Programs (EX:Fedlogic/LSA)

Data fetching
- Page load; data is fetched server-side via Convex queries.

Dependencies
- 02-convex-data-model
- 08-status-update (for inline status select)

Testing
- Integration: toggling tabs updates active state and URL; initial ?created=1 shows alert once.
- Rendering: pages-required chips from sectionsIncludedFlags; changed sections derived from sectionsChangedFlags.

