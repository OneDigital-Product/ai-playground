Title: Shared Types & Validation

Summary
- Define shared TypeScript types and Zod schemas for intake payloads and section payloads; use convex/values on the server for runtime validation.
- Ensures consistent validation on both client and server, mirroring the Express app’s schemas.

User Stories / Acceptance Criteria
- As a developer, I have a single source of truth for IntakeCreate, Intake, SectionPayload, and enums used across UI and Convex queries/mutations/actions.
- Client-side validation errors match server-side errors.

Types & Schemas
- Enums
  - GuideType: 'Update Existing Guide' | 'New Guide Build'
  - CommunicationsAddOns: 'None' | 'OE Letter' | 'OE Presentation' | 'Both' | 'Other'
  - ProductionTime: 'Standard' | 'Rush'
  - Status: 'NOT_STARTED' | 'STARTED' | 'ROADBLOCK' | 'READY_FOR_QA' | 'DELIVERED_TO_CONSULTANT'
  - SectionCode: 'A'..'Q'
- Zod (frontend)
  - IntakeCreateSchema: client_name (non-empty), plan_year (coerce to number; 2025-2026), requestor_name (non-empty), payroll_storage_url (non-empty), guide_type (enum), communications_add_ons (enum), requested_production_time (enum), notes_general (optional); sections flags and per-section change_description.
  - SectionPayloadSchema: { change_description?: string }
- convex/values (backend)
  - Mirror the zod schemas for mutation inputs using v.string(), v.number(), v.union() etc.

Frontend (Next.js)
- Place shared types and zod schemas in apps/enrollment-dashboard/lib/schemas.ts (or shared package if reused elsewhere).
- Use zod in forms for client-side validation and error maps.

Backend (Convex)
- Use convex/values to validate arguments in each query/mutation/action (e.g., v.string(), v.number(), v.id("table")).
- Convert between camelCase in TS and stored field names consistently.

API Contracts
- Standardize error format: { error: 'Validation failed', fieldErrors?: Record<string,string[]> }

Dependencies
- 02-convex-data-model

Testing
- Unit: zod parsing coercion for numbers and enums; convex/values rejects invalid payloads.
- Integration: a failing client validation also fails server-side with aligned messages.

