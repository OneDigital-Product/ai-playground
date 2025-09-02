Title: Create initial section_details on intake creation

Description
- When creating an intake, also create initial `section_details` entries for any sections that are marked changed and have a provided `change_description` from the form. Use `sections.bulkCreate` to upsert per-section payloads.

Acceptance Criteria
- After creating an intake with one or more sections marked changed and descriptions provided, the Intake Detail > Sections tab shows corresponding section entries without additional edits.
- Bulk creation skips sections without descriptions and does not duplicate if called again for the same `intakeId` and section code.

Implementation Notes
- Files:
  - API route: `apps/enrollment-dashboard/src/app/api/intakes/route.ts`
  - Sections API: `packages/backend/convex/functions/sections.ts:bulkCreate` (already implemented)
  - Client form already collects `sectionDescriptions` and changed flags in `apps/enrollment-dashboard/src/components/intake-form.tsx`.
- Approach:
  1) Parse the submitted payload for `sectionsChangedFlags` and `sectionDescriptions` (see task 22 to formalize schema).
  2) Build an array of sections to create:
     ```ts
     const sections = Object.entries(sectionsChangedFlags)
       .filter(([code, changed]) => changed && sectionDescriptions[code])
       .map(([sectionCode]) => ({
         intakeId: created.intakeId,
         sectionCode: sectionCode as any, // A..Q
         payload: { change_description: sectionDescriptions[sectionCode] }
       }));
     ```
  3) Call Convex `sections.bulkCreate(sections)` after `intakes.create` succeeds.
- Example snippet inside the API route after creating the intake:
  ```ts
  if (sections.length > 0) {
    await convex.mutation(
      api.functions.sections.bulkCreate as FunctionReference<"mutation">,
      { sections }
    );
  }
  ```

Dependencies
- 20-wire-intake-create-to-convex.md
- 22-extend-zod-schema-for-section-descriptions.md (recommended so the server sees `sectionDescriptions`)

Estimated Effort
- 30–45 minutes

