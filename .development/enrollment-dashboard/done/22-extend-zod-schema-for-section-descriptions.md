Title: Extend Zod schema to include sectionDescriptions

Description
- Update the frontend Zod schema and TypeScript types to include a `sectionDescriptions: Record<SectionCode,string>` field so the create API route receives the descriptions (instead of being stripped by Zod) and can create initial `section_details`.

Acceptance Criteria
- `intakeCreateSchema` validates and preserves a `sectionDescriptions` object with keys A–Q and string values (allow empty strings, but initial creation will only insert where changed && description present).
- Type `IntakeCreate` (or a new augmented type) includes `sectionDescriptions` and components compile.
- No linter errors and TS type checks pass for the updated schema.

Implementation Notes
- Files:
  - `apps/enrollment-dashboard/src/lib/schemas.ts`
  - `apps/enrollment-dashboard/src/components/intake-form.tsx` (already maintains `sectionDescriptions`)
- Suggested change:
  ```ts
  // in schemas.ts
  export const sectionDescriptionsSchema = z.record(
    z.enum(["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q"]),
    z.string()
  ).default({});

  export const intakeCreateSchema = z.object({
    // ...existing fields
    sectionDescriptions: sectionDescriptionsSchema,
  });

  export type IntakeCreate = z.infer<typeof intakeCreateSchema>;
  ```
- Keep error shape via existing `formatZodError` helpers.

Dependencies
- None (but enables task 21).

Estimated Effort
- 20–30 minutes

