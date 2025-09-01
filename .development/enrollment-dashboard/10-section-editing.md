Title: Section Editing (Per-Section Upsert)

Summary
- Allow admins to edit section details for an intake after creation. Mirrors Express POST /intakes/:id/sections/:code.

User Stories / Acceptance Criteria
- As an admin, on the Intake Detail > Sections tab, I can edit a section’s change_description and save.
- If a section has no prior data and I add a description, it is created; if it exists, it is updated.
- Optionally, I can toggle whether the section is considered "changed" and "included in guide"; these flags update on the intake record.
- Validation errors are shown inline; success shows a toast.

Backend (Convex)
- Mutations:
  - sections:upsert({ intakeId, sectionCode, payload })
    - sectionCode in 'A'..'Q'.
    - payload: { change_description?: string }
    - Creates or updates section_details; updates intake.updatedAt.
  - intakes:updateSectionFlags({ intakeId, sectionCode, changed?: boolean, included?: boolean })
    - Updates sectionsChangedFlags[code] and/or sectionsIncludedFlags[code].
- Queries:
  - sections:getByIntake({ intakeId }) — reused by detail page.

Frontend (Next.js)
- UI on Sections tab:
  - Each present section shows its content and an Edit button.
  - Edit pattern: inline editable textarea or a dialog; Save calls sections:upsert.
  - Optional toggles for Changed and Include in Guide linked to intakes:updateSectionFlags.
- Feedback: success/error toasts; optimistic update optional.

API Contracts
- POST /enrollment-dashboard/api/intakes/[intakeId]/sections/[code] (route handler in app/**/route.ts)
  - Body: { change_description }
  - 200 -> { success: true }
- POST /enrollment-dashboard/api/intakes/[intakeId]/sections/[code]/flags (route handler in app/**/route.ts)
  - Body: { changed?: boolean, included?: boolean }
  - 200 -> { success: true }

Dependencies
- 02-convex-data-model
- 07-intake-detail-and-sections-view

Testing
- Unit: upsert creates then updates; flags mutation flips boolean keys safely.
- Integration: editing updates view without full page reload; empty description removes payload or retains as empty based on UX rule.

