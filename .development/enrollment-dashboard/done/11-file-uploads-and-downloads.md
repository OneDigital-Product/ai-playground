Title: File Uploads and Downloads

Summary
- Support uploading up to 10 files per request with type/size restrictions and secure storage; list and download files per intake.
- Mirrors Express upload constraints (PDF, DOCX, XLSX, PNG, JPG; 25MB per file) and adds Convex storage handling.

User Stories / Acceptance Criteria
- As an admin, I can upload one or more files to an intake with a selected kind (GUIDE, PLAN_DOC, PAYROLL_SCREEN, OTHER).
- If a file exceeds 25MB or has an invalid type, I see a friendly error and other valid files still upload.
- I can view a list of uploaded files on the intake detail page (Overview tab optional section), including type, size, and uploaded date.
- I can download a file; the original filename is preserved.
- I can delete a file, which removes both the DB record and the underlying storage object.

Backend (Convex)
- Storage: Use ctx.storage (StorageWriter/StorageReader). Store storage key in uploads.storedKey.
- Mutations/Actions:
  - uploads:create({ intakeId, kind, file: Blob }):
    - Validate kind enum and size limit; detect mime; write to storage; insert uploads doc.
  - uploads:delete({ id }):
    - Fetch doc; delete storage object; delete doc.
- Queries:
  - uploads:listByIntake({ intakeId }) -> [{ id, kind, originalName, mimeType, bytes, createdAt }]
  - uploads:getDownloadUrl({ id }) -> signed URL or stream proxy (depending on storage pattern)

Frontend (Next.js)
- Components:
  - UploadDropzone (uses input[type=file] multiple or a dropzone; accept: .pdf,.docx,.xlsx,.png,.jpg,.jpeg; max 10 files)
  - UploadList with actions (download, delete) and chips for kind.
- Page integration:
  - On Intake Detail (Overview), render uploads section with upload form and list.
- UX:
  - Show progress per file; show toasts on success/failure; disable over 10 files.

Route Handlers
- POST /enrollment-dashboard/api/intakes/[intakeId]/uploads (route handler in app/**/route.ts)
  - multipart/form-data or upload via Convex action from client; includes kind and files[]
  - 200 -> { files: [{ id, originalName, bytes, mimeType, kind }] }
- GET /enrollment-dashboard/api/uploads/[id]/download (route handler in app/**/route.ts)
  - 302 redirect to signed URL or binary stream
- DELETE /enrollment-dashboard/api/uploads/[id] (route handler in app/**/route.ts)
  - 200 -> { success: true }

Dependencies
- 02-convex-data-model

Testing
- Unit: kind/size/type validation; delete removes storage object.
- Integration: multi-file upload with mixed valid/invalid files; download URL works; delete removes from list.

