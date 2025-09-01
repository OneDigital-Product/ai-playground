Title: Implement uploads flow and usable Uploads page

Description:
- Make the `/enrollment-dashboard/uploads` page functional. The “Upload Files” CTA should open a usable uploader (inline or modal) that allows selecting an Intake and uploading files.
- Reuse the existing `UploadDropzone` and `UploadList` primitives; ensure integration with `POST /enrollment-dashboard/api/intakes/[intakeId]/uploads`.

Acceptance Criteria:
- Clicking “Upload Files” opens an interface to:
  - Select an Intake (searchable select or ID field) OR links user to upload from an Intake detail page with context preselected.
  - Add files via drag-and-drop or file picker.
  - Choose a file type (Guide/Plan Doc/Payroll Screen/Other) before upload.
- Successful upload shows a success toast and the selection clears after completion; errors show per-file messages and a general toast.
- The page renders a “Recent Uploads” list using `UploadList` after any successful upload.
- Basic keyboard operability (Tab, Enter/Space) verified for the dialog and controls.

Estimated Effort/Complexity: M

Dependencies:
- Task 01 (stable API path improves verification, but this task can be built in parallel with mocked responses).

Relevant Files/Components:
- `apps/enrollment-dashboard/src/app/uploads/page.tsx` (wire CTA and layout)
- `apps/enrollment-dashboard/src/components/upload-dropzone.tsx` (uploader)
- `apps/enrollment-dashboard/src/components/upload-list.tsx` (listing)
- Potential new: `apps/enrollment-dashboard/src/components/upload-intake-selector.tsx` or a modal wrapper
