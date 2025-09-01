Title: Create Intake (Single-Page Form)

Summary
- Implement a single-page intake creation flow mirroring the Express app’s /intakes/new and POST /intakes.
- Captures basic info, 17 section changed flags + include flags, simplified change descriptions, and general notes.

User Stories / Acceptance Criteria
- As an admin, I can open /enrollment-dashboard/intakes/new and complete the form.
- Required fields: client_name, plan_year (2025/2026), requestor_name (enum list), payroll_storage_url, guide_type, communications_add_ons, requested_production_time.
- For each section A–Q: I can mark include_in_guide yes/no, and whether it has changes beyond annual updates; if yes, I can enter a change_description text area.
- On success, I am redirected to the intake detail page with a success message.
- On validation error, my inputs persist and errors render inline.

Backend (Convex)
- Schema: tables intakes, section_details, uploads
  - intakes: { _id, intakeId (string, unique), clientName, planYear:number, requestorName, payrollStorageUrl, guideType: 'Update Existing Guide'|'New Guide Build', communicationsAddOns: 'None'|'OE Letter'|'OE Presentation'|'Both'|'Other', requestedProductionTime: 'Standard'|'Rush', notesGeneral?, status: 'NOT_STARTED'|'STARTED'|'ROADBLOCK'|'READY_FOR_QA'|'DELIVERED_TO_CONSULTANT' (default NOT_STARTED), sectionsChangedFlags: Record<A..Q, boolean>, sectionsIncludedFlags: Record<A..Q, boolean>, complexityScore:number, complexityBand: 'Minimal'|'Low'|'Medium'|'High', dates: { receivedAt, createdAt, updatedAt } }
  - section_details: { _id, intakeId (ref), sectionCode: 'A'..'Q', payload: { change_description?: string }, createdAt }
  - uploads: { _id, intakeId(ref), kind: 'GUIDE'|'PLAN_DOC'|'PAYROLL_SCREEN'|'OTHER', originalName, mimeType, bytes:number, storedPath, createdAt }
- Mutations:
  - intakes:create(data): generates intakeId, computes complexity (see 05-complexity-scoring-and-banding.md), validates enums and flags, inserts intake + optional sections.
- Types: Use convex/values for validation (e.g., v.string(), v.number(), v.id("table")) and zod for shared TS types in the app.

Frontend (Next.js)
- Page: /intakes/new with a Server Component for SSR and a Client Component form.
- Components: Form sections using @repo/ui input, select, radio-group, textarea. Keep structure similar to EJS.
- State: Preserve values on validation error (server actions returning formState) or client Zod + URL params.

Route Handler
- POST /enrollment-dashboard/api/intakes (Next route handler in app/**/route.ts)
  - Body: IntakeCreate payload
  - 201 -> { intakeId }
  - 400 -> { fieldErrors }

Dependencies
- 05-complexity-scoring-and-banding

Testing
- Unit: zod schema parsing/coercion; complexity computation; mutation inserts both intake and sections.
- E2E: happy path submit; error path preserves inputs; redirect to detail on success.

