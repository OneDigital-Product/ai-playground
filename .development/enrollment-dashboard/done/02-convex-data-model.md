Title: Convex Data Model (Foundational)

Summary
- Define Convex tables and indexes to support intakes, sections, uploads, stats, and CSV export.

Entities
- intakes
  - _id (Convex Id)
  - intakeId: string (human-friendly id like EG-2025-xxxx)
  - clientName: string
  - planYear: number
  - requestorName: string
  - payrollStorageUrl: string
  - guideType: 'Update Existing Guide' | 'New Guide Build'
  - communicationsAddOns: 'None' | 'OE Letter' | 'OE Presentation' | 'Both' | 'Other'
  - requestedProductionTime: 'Standard' | 'Rush'
  - notesGeneral?: string
  - status: 'NOT_STARTED' | 'STARTED' | 'ROADBLOCK' | 'READY_FOR_QA' | 'DELIVERED_TO_CONSULTANT'
  - sectionsChangedFlags: Record<'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q', boolean>
  - sectionsIncludedFlags: same keys as above, boolean
  - complexityScore: number
  - complexityBand: 'Minimal' | 'Low' | 'Medium' | 'High'
  - dateReceived: string (ISO)
  - createdAt: string (ISO)
  - updatedAt: string (ISO)

- section_details
  - _id
  - intakeId: string (ref to intakes.intakeId)
  - sectionCode: 'A'..'Q'
  - payload: { change_description?: string }
  - createdAt: string (ISO)

- uploads
  - _id
  - intakeId: string
  - kind: 'GUIDE'|'PLAN_DOC'|'PAYROLL_SCREEN'|'OTHER'
  - originalName: string
  - mimeType: string
  - bytes: number
  - storedKey: string (Convex storage id or key)
  - createdAt: string (ISO)

Indexes (Convex)
- intakes by dateReceived desc
- intakes by status
- intakes by complexityBand
- intakes by planYear
- intakes by requestorName (optional for LIKE-ish filter; otherwise scan + filter)
- uploads by intakeId
- section_details by intakeId, and by intakeId+sectionCode

Convex functions (Overview)
- intakes:create, intakes:get, intakes:list, intakes:updateStatus, intakes:delete, intakes:stats, intakes:exportCsv
- sections:upsert, sections:getByIntake, sections:bulkCreate
- uploads:create, uploads:get, uploads:listByIntake, uploads:delete, uploads:download

Dependencies
- None (foundation for all features)

Testing
- Data validation using convex/values (e.g., v.string(), v.number(), v.id("table")) and shared zod types.
- Ensure unique intakeId generation and index coverage for filters used by dashboard.

